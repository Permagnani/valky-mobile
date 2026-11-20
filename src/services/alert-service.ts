import { apiRequest } from '@/services/api-client';
import {
  AlertaRequest,
  AlertaResponse,
  ApiStatusRootResponse,
  AtualizacaoStatusRequest,
  AtualizacaoStatusResponse,
  HealthCheckResponse,
} from '@/types/api';

/**
 * Camada de serviço responsável pelo CRUD de Alertas (/api/alertas),
 * CRUD de Histórico de Atualizações de Status (/api/atualizacoes-status)
 * e Monitoramento de HealthChecks (/health) na Valky.Api (.NET 10).
 * Atende diretamente o Requisito 2 (CRUD com API).
 */
export const AlertService = {
  // ==================== CRUD: ALERTAS DE EMERGÊNCIA ====================

  /**
   * Read (All): GET /api/alertas
   */
  async listarAlertas(): Promise<AlertaResponse[]> {
    return apiRequest<AlertaResponse[]>('/api/alertas', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * Read (By ID): GET /api/alertas/{id}
   */
  async obterAlertaPorId(id: number): Promise<AlertaResponse> {
    return apiRequest<AlertaResponse>(`/api/alertas/${id}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * Create: POST /api/alertas
   */
  async criarAlerta(payload: AlertaRequest): Promise<AlertaResponse> {
    return apiRequest<AlertaResponse>('/api/alertas', {
      method: 'POST',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * Update: PUT /api/alertas/{id}
   */
  async atualizarAlerta(
    id: number,
    payload: AlertaRequest
  ): Promise<AlertaResponse> {
    return apiRequest<AlertaResponse>(`/api/alertas/${id}`, {
      method: 'PUT',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * Delete: DELETE /api/alertas/{id}
   */
  async excluirAlerta(id: number): Promise<void> {
    return apiRequest<void>(`/api/alertas/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },

  // ==================== CRUD: HISTÓRICO DE ATUALIZAÇÕES DE STATUS ====================

  /**
   * Read (All / Filtered by AlertaId): GET /api/atualizacoes-status
   */
  async listarAtualizacoesStatus(
    alertaId?: number
  ): Promise<AtualizacaoStatusResponse[]> {
    const path =
      alertaId !== undefined
        ? `/api/atualizacoes-status?alertaId=${alertaId}`
        : '/api/atualizacoes-status';

    return apiRequest<AtualizacaoStatusResponse[]>(path, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * Read (By ID): GET /api/atualizacoes-status/{id}
   */
  async obterAtualizacaoStatusPorId(
    id: number
  ): Promise<AtualizacaoStatusResponse> {
    return apiRequest<AtualizacaoStatusResponse>(
      `/api/atualizacoes-status/${id}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
  },

  /**
   * Create: POST /api/atualizacoes-status
   * Registra novo andamento da ocorrência e atualiza automaticamente o status do Alerta pai.
   */
  async criarAtualizacaoStatus(
    payload: AtualizacaoStatusRequest
  ): Promise<AtualizacaoStatusResponse> {
    return apiRequest<AtualizacaoStatusResponse>('/api/atualizacoes-status', {
      method: 'POST',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * Update: PUT /api/atualizacoes-status/{id}
   */
  async atualizarAtualizacaoStatus(
    id: number,
    payload: AtualizacaoStatusRequest
  ): Promise<AtualizacaoStatusResponse> {
    return apiRequest<AtualizacaoStatusResponse>(
      `/api/atualizacoes-status/${id}`,
      {
        method: 'PUT',
        body: payload,
        requiresAuth: true,
      }
    );
  },

  /**
   * Delete: DELETE /api/atualizacoes-status/{id}
   */
  async excluirAtualizacaoStatus(id: number): Promise<void> {
    return apiRequest<void>(`/api/atualizacoes-status/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },

  // ==================== MONITORAMENTO / HEALTH CHECK ====================

  /**
   * GET /health
   */
  async verificarHealthCheck(): Promise<HealthCheckResponse> {
    return apiRequest<HealthCheckResponse>('/health', {
      method: 'GET',
      requiresAuth: false,
      timeoutMs: 8000,
    });
  },

  /**
   * GET /
   */
  async obterStatusRaiz(): Promise<ApiStatusRootResponse> {
    return apiRequest<ApiStatusRootResponse>('/', {
      method: 'GET',
      requiresAuth: false,
      timeoutMs: 8000,
    });
  },
};
