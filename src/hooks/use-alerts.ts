import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { AlertService } from '@/services/alert-service';
import { ApiError } from '@/services/api-client';
import {
  AlertaRequest,
  AlertaResponse,
  AtualizacaoStatusRequest,
  AtualizacaoStatusResponse,
} from '@/types/api';

/**
 * Custom Hook que utiliza useEffect e useCallback para gerenciar o CRUD duplo
 * de Alertas (/api/alertas) e Histórico de Status (/api/atualizacoes-status),
 * integrando-se também com parâmetros de rota do Expo Router (useLocalSearchParams).
 */
export function useAlerts(initialAlertaIdParam?: number) {
  const { isAuthenticated } = useAuth();

  const [alertas, setAlertas] = useState<AlertaResponse[]>([]);
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaResponse | null>(
    null
  );
  const [historico, setHistorico] = useState<AtualizacaoStatusResponse[]>([]);

  const [loadingAlertas, setLoadingAlertas] = useState<boolean>(false);
  const [loadingHistorico, setLoadingHistorico] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | string | string[] | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const carregarAlertas = useCallback(async () => {
    setLoadingAlertas(true);
    setError(null);
    try {
      const lista = await AlertService.listarAlertas();
      setAlertas(lista);

      if (lista.length > 0) {
        setSelectedAlerta((prev) => {
          if (initialAlertaIdParam) {
            const fromParam = lista.find((a) => a.id === initialAlertaIdParam);
            if (fromParam) return fromParam;
          }
          if (!prev) return lista[0];
          return lista.find((a) => a.id === prev.id) ?? lista[0];
        });
      } else {
        setSelectedAlerta(null);
        setHistorico([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Erro ao carregar os alertas da API.');
      }
    } finally {
      setLoadingAlertas(false);
    }
  }, [initialAlertaIdParam]);

  const carregarHistorico = useCallback(async (alertaId: number) => {
    setLoadingHistorico(true);
    try {
      const lista = await AlertService.listarAtualizacoesStatus(alertaId);
      setHistorico(lista);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      }
    } finally {
      setLoadingHistorico(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      carregarAlertas();
    } else {
      setAlertas([]);
      setSelectedAlerta(null);
      setHistorico([]);
    }
  }, [isAuthenticated, carregarAlertas]);

  useEffect(() => {
    if (selectedAlerta) {
      carregarHistorico(selectedAlerta.id);
    }
  }, [selectedAlerta, carregarHistorico]);

  const salvarAlerta = useCallback(
    async (payload: AlertaRequest, editingId?: number): Promise<boolean> => {
      setError(null);
      setSuccessMsg(null);
      setSubmitting(true);
      try {
        if (editingId !== undefined) {
          const atualizado = await AlertService.atualizarAlerta(
            editingId,
            payload
          );
          setSuccessMsg(
            `Alerta #${atualizado.id} atualizado via PUT /api/alertas/${atualizado.id}.`
          );
          setSelectedAlerta(atualizado);
        } else {
          const criado = await AlertService.criarAlerta(payload);
          setSuccessMsg(
            `Alerta de emergência #${criado.id} disparado via POST /api/alertas!`
          );
          setSelectedAlerta(criado);
        }
        await carregarAlertas();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError('Não foi possível salvar o alerta.');
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [carregarAlertas]
  );

  const excluirAlerta = useCallback(
    async (alerta: AlertaResponse) => {
      setError(null);
      setSuccessMsg(null);
      setSubmitting(true);
      try {
        await AlertService.excluirAlerta(alerta.id);
        setSuccessMsg(
          `Alerta #${alerta.id} excluído via DELETE /api/alertas/${alerta.id}.`
        );
        await carregarAlertas();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError('Erro ao excluir o alerta.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [carregarAlertas]
  );

  const salvarStatus = useCallback(
    async (
      payload: AtualizacaoStatusRequest,
      editingStatusId?: number
    ): Promise<boolean> => {
      setError(null);
      setSuccessMsg(null);
      setSubmitting(true);
      try {
        if (editingStatusId !== undefined) {
          await AlertService.atualizarAtualizacaoStatus(
            editingStatusId,
            payload
          );
          setSuccessMsg(
            `Registro de histórico #${editingStatusId} atualizado (PUT).`
          );
        } else {
          await AlertService.criarAtualizacaoStatus(payload);
          setSuccessMsg(
            `Novo andamento policial registrado para o Alerta #${payload.alertaId}!`
          );
        }
        await carregarAlertas();
        await carregarHistorico(payload.alertaId);
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError('Erro ao registrar atualização de status.');
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [carregarAlertas, carregarHistorico]
  );

  const excluirStatus = useCallback(
    async (item: AtualizacaoStatusResponse) => {
      setError(null);
      setSuccessMsg(null);
      try {
        await AlertService.excluirAtualizacaoStatus(item.id);
        setSuccessMsg(
          `Item de histórico #${item.id} removido (DELETE /api/atualizacoes-status/${item.id}).`
        );
        await carregarHistorico(item.alertaId);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        }
      }
    },
    [carregarHistorico]
  );

  return {
    alertas,
    selectedAlerta,
    setSelectedAlerta,
    historico,
    loadingAlertas,
    loadingHistorico,
    submitting,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    carregarAlertas,
    carregarHistorico,
    salvarAlerta,
    excluirAlerta,
    salvarStatus,
    excluirStatus,
  };
}
