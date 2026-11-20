import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ApiConfigModal } from '@/components/api-config-modal';
import { ErrorBanner, SuccessBanner } from '@/components/status-feedback';
import { ValkyColors, ValkyShadows } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api-client';

export default function LoginScreen() {
  const { login, isLoading, apiUrl } = useAuth();
  const params = useLocalSearchParams<{ redirect?: string; email?: string }>();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState<ApiError | string | string[] | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
  }, [params.email]);

  const handleLogin = async () => {
    setError(null);
    setSuccessMsg(null);

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailLimpo)) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }
    if (!senha || senha.trim().length === 0) {
      setError('Informe a sua senha de acesso.');
      return;
    }

    try {
      const usuario = await login({ email: emailLimpo, senha });
      setSuccessMsg(`Bem-vinda de volta, ${usuario.nome}! Redirecionando...`);
      const targetRoute = params.redirect || '/';
      router.replace(targetRoute as never);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Não foi possível realizar a autenticação.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroBox}>
          <Text style={styles.eyebrow}>AUTENTICAÇÃO SEGURA • JWT</Text>
          <Text style={styles.title}>Acesse sua conta Valky</Text>
          <Text style={styles.subtitle}>
            Entre para gerenciar sua ficha de proteção, contatos da rede de
            confiança e acompanhar alertas em tempo real.
          </Text>
          {params.redirect ? (
            <Text style={styles.redirectHint}>
              Faça login para continuar para {params.redirect}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={styles.apiStatusBar}
          onPress={() => setApiModalOpen(true)}
        >
          <View>
            <Text style={styles.apiStatusLabel}>
              SERVIDOR BACKEND (.NET 10 + ORACLE)
            </Text>
            <Text style={styles.apiStatusUrl}>{apiUrl}</Text>
          </View>
          <Text style={styles.apiChangeBtn}>Configurar ›</Text>
        </Pressable>

        <View style={[styles.formCard, ValkyShadows.card]}>
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
          <SuccessBanner
            message={successMsg}
            onDismiss={() => setSuccessMsg(null)}
          />

          <Text style={styles.label}>E-mail cadastrado</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="maria.silva@email.com"
            placeholderTextColor="#B09DA2"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Senha</Text>
            <Pressable onPress={() => setMostrarSenha((v) => !v)}>
              <Text style={styles.togglePass}>
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            placeholderTextColor="#B09DA2"
            secureTextEntry={!mostrarSenha}
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={ValkyColors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Entrar com Token JWT →</Text>
            )}
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.signupPrompt}>
            Ainda não possui cadastro no Valky?
          </Text>

          <Link href={'/signup' as never} asChild>
            <Pressable style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>
                Criar conta com número do BO
              </Text>
            </Pressable>
          </Link>
        </View>

        <Link href={'/calculator' as never} asChild>
          <Pressable style={styles.disguiseBanner}>
            <View style={styles.disguiseIconBox}>
              <Text style={styles.disguiseIcon}>⊞</Text>
            </View>
            <View style={styles.disguiseTextBox}>
              <Text style={styles.disguiseTitle}>
                Abrir Calculadora Disfarçada
              </Text>
              <Text style={styles.disguiseDesc}>
                Em situação de risco imediato, acesse o modo camuflado e digite
                seu código seguido de =.
              </Text>
            </View>
          </Pressable>
        </Link>
      </ScrollView>

      <ApiConfigModal
        visible={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ValkyColors.background,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 48,
  },
  heroBox: {
    marginBottom: 18,
  },
  eyebrow: {
    color: ValkyColors.secondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  redirectHint: {
    color: ValkyColors.warning,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  apiStatusBar: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apiStatusLabel: {
    color: ValkyColors.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  apiStatusUrl: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  apiChangeBtn: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    marginBottom: 18,
  },
  label: {
    color: ValkyColors.primary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  togglePass: {
    color: ValkyColors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: ValkyColors.background,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: ValkyColors.textPrimary,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: ValkyColors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: ValkyColors.border,
    marginVertical: 18,
  },
  signupPrompt: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  secondaryBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: ValkyColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  disguiseBanner: {
    backgroundColor: '#252528',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  disguiseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FF9F0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disguiseIcon: {
    color: ValkyColors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  disguiseTextBox: {
    flex: 1,
  },
  disguiseTitle: {
    color: ValkyColors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  disguiseDesc: {
    color: '#D1D1D6',
    fontSize: 12,
    lineHeight: 17,
  },
});
