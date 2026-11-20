import { apiRequest } from '@/services/api-client';
import {
  AlterarSenhaRequest,
  AtualizarUsuarioRequest,
  ContatoConfiancaRequest,
  ContatoConfiancaResponse,
  PerfilUsuario,
  RegistrarUsuarioRequest,
  UsuarioResponse,
} from '@/types/api';

/**
 * Camada de serviço responsável pelo CRUD completo de Usuários e Rede de Contatos de Confiança
 * (/api/usuarios e /api/usuarios/{id}/contatos-confianca) na Valky.Api (.NET 10).
 * Atende diretamente o Requisito 2 (CRUD com API).
 */
export const UserService = {
  /**
   * GET /api/usuarios
   */
  async listarUsuarios(filtros?: {
    perfil?: PerfilUsuario;
    ativo?: boolean;
  }): Promise<UsuarioResponse[]> {
    const params = new URLSearchParams();
    if (filtros?.perfil) params.append('perfil', filtros.perfil);
    if (filtros?.ativo !== undefined)
      params.append('ativo', String(filtros.ativo));

    const query = params.toString();
    const path = query ? `/api/usuarios?${query}` : '/api/usuarios';

    return apiRequest<UsuarioResponse[]>(path, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * GET /api/usuarios/{id}
   */
  async obterPorId(id: number): Promise<UsuarioResponse> {
    return apiRequest<UsuarioResponse>(`/api/usuarios/${id}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * POST /api/usuarios
   */
  async criarUsuario(
    payload: RegistrarUsuarioRequest
  ): Promise<UsuarioResponse> {
    return apiRequest<UsuarioResponse>('/api/usuarios', {
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },

  /**
   * PUT /api/usuarios/{id}
   * Atualiza dados cadastrais, número do BO, PIN da calculadora disfarçada,
   * medida protetiva e permissões de microfone/localização.
   */
  async atualizarUsuario(
    id: number,
    payload: AtualizarUsuarioRequest
  ): Promise<UsuarioResponse> {
    return apiRequest<UsuarioResponse>(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * PATCH /api/usuarios/{id}/senha
   */
  async alterarSenha(id: number, payload: AlterarSenhaRequest): Promise<void> {
    return apiRequest<void>(`/api/usuarios/${id}/senha`, {
      method: 'PATCH',
      body: payload,
      requiresAuth: true,
    });
  },

  /**
   * DELETE /api/usuarios/{id}
   */
  async excluirUsuario(id: number): Promise<void> {
    return apiRequest<void>(`/api/usuarios/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },

  // ==================== CRUD: REDE DE CONTATOS DE CONFIANÇA ====================

  /**
   * Read: GET /api/usuarios/{usuarioId}/contatos-confianca
   */
  async listarContatosConfianca(
    usuarioId: number
  ): Promise<ContatoConfiancaResponse[]> {
    return apiRequest<ContatoConfiancaResponse[]>(
      `/api/usuarios/${usuarioId}/contatos-confianca`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
  },

  /**
   * Create: POST /api/usuarios/{usuarioId}/contatos-confianca
   */
  async adicionarContatoConfianca(
    usuarioId: number,
    payload: ContatoConfiancaRequest
  ): Promise<ContatoConfiancaResponse> {
    return apiRequest<ContatoConfiancaResponse>(
      `/api/usuarios/${usuarioId}/contatos-confianca`,
      {
        method: 'POST',
        body: payload,
        requiresAuth: true,
      }
    );
  },

  /**
   * Update: PUT /api/usuarios/{usuarioId}/contatos-confianca/{contatoId}
   */
  async atualizarContatoConfianca(
    usuarioId: number,
    contatoId: number,
    payload: ContatoConfiancaRequest
  ): Promise<ContatoConfiancaResponse> {
    return apiRequest<ContatoConfiancaResponse>(
      `/api/usuarios/${usuarioId}/contatos-confianca/${contatoId}`,
      {
        method: 'PUT',
        body: payload,
        requiresAuth: true,
      }
    );
  },

  /**
   * Delete: DELETE /api/usuarios/{usuarioId}/contatos-confianca/{contatoId}
   */
  async removerContatoConfianca(
    usuarioId: number,
    contatoId: number
  ): Promise<void> {
    return apiRequest<void>(
      `/api/usuarios/${usuarioId}/contatos-confianca/${contatoId}`,
      {
        method: 'DELETE',
        requiresAuth: true,
      }
    );
  },
};
