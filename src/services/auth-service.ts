import { apiRequest } from '@/services/api-client';
import {
  AuthTokenResponse,
  LoginRequest,
  RegistrarUsuarioRequest,
  UsuarioResponse,
} from '@/types/api';

/**
 * Camada de serviço responsável pela Autenticação JWT (/api/auth) na Valky.Api (.NET 10).
 * Atende diretamente o Requisito 3 (Sistema de Autenticação).
 */
export const AuthService = {
  /**
   * POST /api/auth/registrar
   * Cadastra um novo usuário no Oracle Database via EF Core e já retorna o token JWT assinado.
   */
  async registrar(payload: RegistrarUsuarioRequest): Promise<AuthTokenResponse> {
    return apiRequest<AuthTokenResponse>('/api/auth/registrar', {
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },

  /**
   * POST /api/auth/login
   * Autentica com e-mail e senha (hash PBKDF2-SHA256) e retorna o token JWT + perfil completo.
   */
  async login(payload: LoginRequest): Promise<AuthTokenResponse> {
    return apiRequest<AuthTokenResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },

  /**
   * GET /api/auth/me
   * Obtém os dados atualizados da usuária autenticada pelo token JWT, incluindo
   * seus contatos de confiança e o diagnóstico ProntaParaAlertaSilencioso.
   */
  async obterPerfilAutenticado(): Promise<UsuarioResponse> {
    return apiRequest<UsuarioResponse>('/api/auth/me', {
      method: 'GET',
      requiresAuth: true,
    });
  },
};
