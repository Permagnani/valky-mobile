import { getDefaultApiBaseUrl } from '@/constants/app-info';
import { ProblemDetailsResponse } from '@/types/api';

/**
 * Exceção estruturada da camada de acesso à API REST (Requisito 2).
 * Traduz respostas RFC 7807 (ProblemDetails) da Valky.Api (.NET 10) em mensagens claras para a UI.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly title: string;
  public readonly detail: string;
  public readonly erros: string[];
  public readonly codigoErro?: string;
  public readonly codigoOracle?: string;
  public readonly retryAfterSeconds?: number;

  constructor(params: {
    status: number;
    title: string;
    detail: string;
    erros?: string[];
    codigoErro?: string;
    codigoOracle?: string;
    retryAfterSeconds?: number;
  }) {
    super(params.detail);
    this.name = 'ApiError';
    this.status = params.status;
    this.title = params.title;
    this.detail = params.detail;
    this.erros =
      params.erros && params.erros.length > 0 ? params.erros : [params.detail];
    this.codigoErro = params.codigoErro;
    this.codigoOracle = params.codigoOracle;
    this.retryAfterSeconds = params.retryAfterSeconds;
  }
}

let currentApiBaseUrl = getDefaultApiBaseUrl();
let currentJwtToken: string | null = null;
const clientInstanceId = `valky-mobile-${Math.random()
  .toString(36)
  .slice(2, 10)}`;

export function getApiBaseUrl(): string {
  return currentApiBaseUrl;
}

export function setApiBaseUrl(newUrl: string): void {
  const cleaned = newUrl.trim().replace(/\/+$/, '');
  if (cleaned.length > 0) {
    currentApiBaseUrl = cleaned;
  }
}

export function getAuthToken(): string | null {
  return currentJwtToken;
}

export function setAuthToken(token: string | null): void {
  currentJwtToken = token;
}

function extrairErrosProblemDetails(problem: ProblemDetailsResponse): string[] {
  const lista: string[] = [];

  if (problem.errors) {
    Object.values(problem.errors).forEach((arr) => {
      if (Array.isArray(arr)) {
        arr.forEach((msg) => {
          if (msg && !lista.includes(msg)) {
            lista.push(msg);
          }
        });
      }
    });
  }

  const principal = problem.detail ?? problem.mensagem ?? problem.title;
  if (principal && lista.length === 0) {
    lista.push(principal);
  }

  return lista;
}

function normalizarPayloadHealthCheck(
  endpointPath: string,
  parsedJson: unknown
): unknown {
  if (
    endpointPath === '/health' &&
    parsedJson &&
    typeof parsedJson === 'object'
  ) {
    const raw = parsedJson as Record<string, unknown>;
    const duracao =
      typeof raw.tempoTotalMs === 'number'
        ? raw.tempoTotalMs
        : typeof raw.duracaoTotalMs === 'number'
        ? Math.round(raw.duracaoTotalMs)
        : 0;

    const rawList = Array.isArray(raw.verificacoes) ? raw.verificacoes : [];
    const verificacoes = rawList.map((item) => {
      const entry = (item ?? {}) as Record<string, unknown>;
      return {
        nome: String(entry.nome ?? entry.componente ?? 'banco-de-dados'),
        status: String(entry.status ?? 'Unknown'),
        descricao: entry.descricao ? String(entry.descricao) : null,
        duracaoMs:
          typeof entry.duracaoMs === 'number'
            ? Math.round(entry.duracaoMs)
            : 0,
      };
    });

    return {
      status: String(raw.status ?? 'Online'),
      verificadoEmUtc: String(
        raw.verificadoEmUtc ?? raw.timestamp ?? new Date().toISOString()
      ),
      tempoTotalMs: duracao,
      verificacoes,
    };
  }
  return parsedJson;
}

function obterUrlsCandidatas(primaryBaseUrl: string): string[] {
  const candidatas: string[] = [primaryBaseUrl];

  const isLocal =
    primaryBaseUrl.includes('localhost') ||
    primaryBaseUrl.includes('127.0.0.1') ||
    primaryBaseUrl.includes('10.0.2.2') ||
    primaryBaseUrl.includes('__valky_proxy');

  if (isLocal) {
    const locais = [
      'http://localhost:54300',
      'https://localhost:54300',
      'http://localhost:54301',
    ];
    if (typeof window !== 'undefined' && window.location?.origin) {
      locais.push(`${window.location.origin}/__valky_proxy`);
    }
    locais.forEach((u) => {
      if (!candidatas.includes(u)) {
        candidatas.push(u);
      }
    });
  }

  return candidatas;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  requiresAuth?: boolean;
  timeoutMs?: number;
}

/**
 * Executa uma chamada HTTP usando Fetch para a Valky.Api (.NET 10),
 * injetando automaticamente o token JWT Bearer e o header X-Client-Id (Rate Limiting CGNAT).
 */
export async function apiRequest<T>(
  endpointPath: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    requiresAuth = true,
    timeoutMs = 15000,
  } = options;

  const cleanPath = endpointPath.startsWith('/')
    ? endpointPath
    : `/${endpointPath}`;

  const headers: Record<string, string> = {
    Accept: 'application/json, application/problem+json',
    'X-Client-Id': clientInstanceId,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth && currentJwtToken) {
    headers.Authorization = `Bearer ${currentJwtToken}`;
  }

  const urlsCandidatas = obterUrlsCandidatas(currentApiBaseUrl);
  let response: Response | null = null;
  let lastError: unknown = null;

  for (const baseUrl of urlsCandidatas) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const candidateResponse = await fetch(`${baseUrl}${cleanPath}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Se estamos usando o proxy local do Metro e ele retornou 404 do bundle HTML, ignora
      const contentType = candidateResponse.headers.get('content-type') ?? '';
      if (
        baseUrl.endsWith('/__valky_proxy') &&
        contentType.includes('text/html')
      ) {
        continue;
      }

      response = candidateResponse;
      if (
        baseUrl !== currentApiBaseUrl &&
        !baseUrl.endsWith('/__valky_proxy')
      ) {
        currentApiBaseUrl = baseUrl;
      }
      break;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err;
    }
  }

  if (!response) {
    if (lastError instanceof Error && lastError.name === 'AbortError') {
      throw new ApiError({
        status: 504,
        title: 'Tempo limite excedido',
        detail: `O servidor (${currentApiBaseUrl}) demorou mais de ${Math.round(
          timeoutMs / 1000
        )}s para responder. Verifique se a Valky.Api está em execução.`,
        codigoErro: 'TEMPO_LIMITE_EXCEDIDO',
      });
    }

    throw new ApiError({
      status: 0,
      title: 'Servidor da API inacessível',
      detail: `Não foi possível conectar à Valky.Api em ${currentApiBaseUrl}. Verifique se o backend .NET está rodando na porta 54300 ou ajuste o endereço da API no botão "API".`,
      codigoErro: 'FALHA_CONEXAO_REDE',
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const rawText = await response.text();
  let parsedJson: unknown = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      parsedJson = null;
    }
  }

  // Caso especial: /health pode retornar 503 Unhealthy quando o Oracle está indisponível, mas ainda é um payload válido de HealthCheck
  if (
    cleanPath === '/health' &&
    parsedJson &&
    typeof parsedJson === 'object' &&
    'status' in (parsedJson as Record<string, unknown>) &&
    'verificacoes' in (parsedJson as Record<string, unknown>)
  ) {
    return normalizarPayloadHealthCheck(cleanPath, parsedJson) as T;
  }

  if (!response.ok) {
    const problem = (parsedJson ?? {}) as ProblemDetailsResponse;
    const retryHeader = response.headers.get('Retry-After');
    const retryAfterSeconds = retryHeader ? Number(retryHeader) : undefined;
    const listaErros = extrairErrosProblemDetails(problem);

    const detail =
      listaErros[0] ??
      problem.detail ??
      problem.mensagem ??
      `A API retornou o código HTTP ${response.status}.`;

    throw new ApiError({
      status: response.status,
      title: problem.title ?? `Erro HTTP ${response.status}`,
      detail,
      erros: listaErros,
      codigoErro: problem.codigoErro,
      codigoOracle: problem.codigoOracle,
      retryAfterSeconds: Number.isNaN(retryAfterSeconds)
        ? undefined
        : retryAfterSeconds,
    });
  }

  return normalizarPayloadHealthCheck(cleanPath, parsedJson) as T;
}
