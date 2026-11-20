import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ValkyColors } from '@/constants/valky-theme';
import { ApiError } from '@/services/api-client';

interface ErrorBannerProps {
  error: ApiError | string | string[] | null;
  onDismiss?: () => void;
}

/**
 * Componente padronizado de feedback visual para erros de validação e respostas
 * RFC 7807 (ProblemDetails) da Valky.Api (.NET 10).
 * Atende diretamente o Requisito 2 e Requisito 3 ("feedbacks visuais em caso de erro").
 */
export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  let titulo = 'Atenção';
  let mensagens: string[] = [];
  let codigoBadge: string | undefined;

  if (error instanceof ApiError) {
    titulo = error.title || `Erro HTTP ${error.status}`;
    mensagens = error.erros;
    if (error.codigoErro) {
      codigoBadge = error.codigoOracle
        ? `${error.codigoErro} • ${error.codigoOracle}`
        : error.codigoErro;
    }
    if (error.retryAfterSeconds) {
      mensagens = [
        ...mensagens,
        `Aguarde cerca de ${error.retryAfterSeconds}s antes de tentar novamente (Rate Limiting).`,
      ];
    }
  } else if (Array.isArray(error)) {
    if (error.length === 0) return null;
    titulo = 'Verifique os campos informados';
    mensagens = error;
  } else {
    mensagens = [error];
  }

  return (
    <View style={styles.errorContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.errorTitle}>⚠ {titulo}</Text>
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Text style={styles.dismissError}>✕</Text>
          </Pressable>
        )}
      </View>

      {codigoBadge && <Text style={styles.codeBadge}>{codigoBadge}</Text>}

      {mensagens.map((msg, idx) => (
        <Text key={`${idx}-${msg}`} style={styles.errorItem}>
          {mensagens.length > 1 ? `• ${msg}` : msg}
        </Text>
      ))}
    </View>
  );
}

interface SuccessBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
  if (!message) return null;

  return (
    <View style={styles.successContainer}>
      <Text style={styles.successText}>✓ {message}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={styles.dismissSuccess}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

export function LoadingView({
  label = 'Sincronizando com a Valky.Api...',
}: {
  label?: string;
}) {
  return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="small" color={ValkyColors.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: ValkyColors.dangerBg,
    borderColor: ValkyColors.dangerBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorTitle: {
    color: ValkyColors.danger,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  dismissError: {
    color: ValkyColors.danger,
    fontWeight: 'bold',
    fontSize: 15,
    paddingLeft: 8,
  },
  codeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7D4DC',
    color: ValkyColors.danger,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  errorItem: {
    color: '#7A1F30',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  successContainer: {
    backgroundColor: ValkyColors.successBg,
    borderColor: ValkyColors.successBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successText: {
    color: ValkyColors.success,
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  dismissSuccess: {
    color: ValkyColors.success,
    fontWeight: 'bold',
    fontSize: 15,
    paddingLeft: 10,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  loadingText: {
    color: ValkyColors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
