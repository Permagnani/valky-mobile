import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api-client';
import { UserService } from '@/services/user-service';
import {
  ContatoConfiancaRequest,
  ContatoConfiancaResponse,
} from '@/types/api';

/**
 * Custom Hook que utiliza useEffect e useCallback para gerenciar todo o ciclo de vida
 * e as 4 operações CRUD da Rede de Contatos de Confiança na Valky.Api (.NET 10).
 */
export function useContacts() {
  const { usuario, isAuthenticated, recarregarPerfil } = useAuth();

  const [contatos, setContatos] = useState<ContatoConfiancaResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<ApiError | string | string[] | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const carregarContatos = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    setError(null);
    try {
      const lista = await UserService.listarContatosConfianca(usuario.id);
      setContatos(lista);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Erro ao carregar os contatos da rede de confiança.');
      }
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (isAuthenticated && usuario) {
      carregarContatos();
    } else {
      setContatos([]);
    }
  }, [isAuthenticated, usuario, carregarContatos]);

  const salvarContato = useCallback(
    async (
      payload: ContatoConfiancaRequest,
      contatoIdParaEdicao?: number
    ): Promise<boolean> => {
      if (!usuario) return false;
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      try {
        if (contatoIdParaEdicao !== undefined) {
          await UserService.atualizarContatoConfianca(
            usuario.id,
            contatoIdParaEdicao,
            payload
          );
          setSuccessMsg(`Contato "${payload.nome}" atualizado com sucesso!`);
        } else {
          await UserService.adicionarContatoConfianca(usuario.id, payload);
          setSuccessMsg(
            `Contato "${payload.nome}" adicionado à sua rede de confiança!`
          );
        }
        await carregarContatos();
        await recarregarPerfil();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          throw err;
        }
        throw new Error('Não foi possível salvar o contato de confiança.');
      } finally {
        setSaving(false);
      }
    },
    [usuario, carregarContatos, recarregarPerfil]
  );

  const removerContato = useCallback(
    async (contato: ContatoConfiancaResponse) => {
      if (!usuario) return;
      setError(null);
      setSuccessMsg(null);
      setDeletingId(contato.id);
      try {
        await UserService.removerContatoConfianca(usuario.id, contato.id);
        setSuccessMsg(`Contato "${contato.nome}" removido da sua rede.`);
        await carregarContatos();
        await recarregarPerfil();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError('Erro ao remover o contato de confiança.');
        }
      } finally {
        setDeletingId(null);
      }
    },
    [usuario, carregarContatos, recarregarPerfil]
  );

  return {
    contatos,
    loading,
    saving,
    deletingId,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    carregarContatos,
    salvarContato,
    removerContato,
  };
}
