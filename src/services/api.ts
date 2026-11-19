
import { getToken, saveToken } from './auth-storage';

const API_URL = 'http://192.168.0.2:8080';

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  usuarioId: number;
  nome: string;
  perfil: string;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const token =
    endpoint === '/api/auth/login' ? null : await getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      data?.mensagem || `Erro na API: ${response.status}`,
    );
  }

  return data;
}

export async function login(
  email: string,
  senha: string,
): Promise<LoginResponse> {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });

  await saveToken(data.token);

  return data;
}
