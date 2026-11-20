import { useCallback, useEffect, useState } from 'react';

import { AlertService } from '@/services/alert-service';
import { ApiError } from '@/services/api-client';
import {
  ApiStatusRootResponse,
  HealthCheckResponse,
} from '@/types/api';

/**
 * Custom Hook que utiliza useEffect para verificar a saúde (/health) e o status raiz (/)
 * da Valky.Api (.NET 10 + Oracle Database).
 */
export function useApiHealth(apiUrl: string, autoCheckOnMount = true) {
  const [rootStatus, setRootStatus] = useState<ApiStatusRootResponse | null>(
    null
  );
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const verificarBackend = useCallback(async () => {
    setChecking(true);
    setApiError(null);
    try {
      const [raiz, saude] = await Promise.all([
        AlertService.obterStatusRaiz(),
        AlertService.verificarHealthCheck(),
      ]);
      setRootStatus(raiz);
      setHealth(saude);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(`${err.title}: ${err.detail}`);
      } else {
        setApiError(
          `Backend offline ou inacessível em ${apiUrl}. Inicie a Valky.Api (.NET 10) para validar o HealthCheck ao vivo.`
        );
      }
    } finally {
      setChecking(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (autoCheckOnMount) {
      verificarBackend();
    }
  }, [autoCheckOnMount, verificarBackend]);

  return {
    rootStatus,
    health,
    checking,
    apiError,
    verificarBackend,
  };
}
