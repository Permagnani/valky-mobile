import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API_URL_PRESETS } from '@/constants/app-info';
import { ValkyColors } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { useApiHealth } from '@/hooks/use-api-health';

interface ApiConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal utilitário para alternar entre o endereço da Valky.Api local (Emulador Android 10.0.2.2,
 * Localhost ou IP da rede Wi-Fi) e o Azure App Service, testando o endpoint /health via useApiHealth.
 */
export function ApiConfigModal({ visible, onClose }: ApiConfigModalProps) {
  const { apiUrl, alterarApiUrl } = useAuth();
  const [customUrl, setCustomUrl] = useState(apiUrl);
  const { health, checking, apiError, verificarBackend } = useApiHealth(
    apiUrl,
    false
  );

  useEffect(() => {
    setCustomUrl(apiUrl);
  }, [apiUrl]);

  const handleSelectUrl = (url: string) => {
    setCustomUrl(url);
    alterarApiUrl(url);
  };

  const handleSaveAndTest = async () => {
    const cleaned = customUrl.trim().replace(/\/+$/, '');
    if (!cleaned) return;
    alterarApiUrl(cleaned);
    await verificarBackend();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Conexão com a Valky.Api (.NET 10)</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeText}>Fechar ✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Selecione ou digite a URL onde a sua Valky.Api (.NET 10 + Oracle)
              está rodando:
            </Text>

            <Text style={styles.label}>URL base da API</Text>
            <TextInput
              style={styles.input}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="http://localhost:54300"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Atalhos rápidos de ambiente</Text>
            {API_URL_PRESETS.map((preset) => {
              const active = customUrl === preset.url;
              return (
                <Pressable
                  key={preset.url}
                  onPress={() => handleSelectUrl(preset.url)}
                  style={[styles.presetCard, active && styles.presetCardActive]}
                >
                  <Text
                    style={[
                      styles.presetLabel,
                      active && styles.presetLabelActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                  <Text style={styles.presetUrl}>{preset.url}</Text>
                  <Text style={styles.presetHint}>{preset.hint}</Text>
                </Pressable>
              );
            })}

            {health && (
              <View style={styles.healthOkBox}>
                <Text style={styles.healthOkTitle}>
                  ✓ API Online — Status: {health.status} ({health.tempoTotalMs}{' '}
                  ms)
                </Text>
                {health.verificacoes?.map((v) => (
                  <Text key={v.nome} style={styles.healthItem}>
                    • {v.nome}: {v.status} ({Math.round(v.duracaoMs)} ms)
                  </Text>
                ))}
              </View>
            )}

            {apiError && (
              <View style={styles.healthErrBox}>
                <Text style={styles.healthErrText}>⚠ {apiError}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <Pressable
                style={styles.testButton}
                onPress={handleSaveAndTest}
                disabled={checking}
              >
                {checking ? (
                  <ActivityIndicator size="small" color={ValkyColors.white} />
                ) : (
                  <Text style={styles.testButtonText}>
                    Salvar e Testar /health
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 22, 27, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: ValkyColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeText: {
    color: ValkyColors.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  label: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: ValkyColors.white,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: ValkyColors.textPrimary,
    marginBottom: 10,
  },
  presetCard: {
    backgroundColor: ValkyColors.white,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  presetCardActive: {
    borderColor: ValkyColors.primary,
    backgroundColor: ValkyColors.surfaceMuted,
  },
  presetLabel: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  presetLabelActive: {
    color: ValkyColors.primaryDark,
  },
  presetUrl: {
    color: ValkyColors.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  presetHint: {
    color: ValkyColors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  healthOkBox: {
    backgroundColor: ValkyColors.successBg,
    borderColor: ValkyColors.successBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  healthOkTitle: {
    color: ValkyColors.success,
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  healthItem: {
    color: ValkyColors.success,
    fontSize: 12,
  },
  healthErrBox: {
    backgroundColor: ValkyColors.dangerBg,
    borderColor: ValkyColors.dangerBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  healthErrText: {
    color: ValkyColors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    marginTop: 16,
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  testButtonText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
