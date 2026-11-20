import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ErrorBanner } from '@/components/status-feedback';
import {
  ValkyColors,
  ValkyPerfilMeta,
  ValkyShadows,
} from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api-client';
import { PerfilUsuario } from '@/types/api';
import {
  formatarCpf,
  formatarTelefone,
  gerarCpfValidoDemo,
  normalizarDigitos,
  validarFormularioCadastro,
} from '@/utils/validators';

const PERFIS: PerfilUsuario[] = ['USUARIA', 'CONTATO_CONFIANCA', 'POLICIA'];

export default function SignupScreen() {
  const { registrar, isLoading } = useAuth();
  const params = useLocalSearchParams<{ perfil?: PerfilUsuario }>();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('USUARIA');
  const [codigoBo, setCodigoBo] = useState('BO-2026-00190');
  const [pinDisfarce, setPinDisfarce] = useState('1901');
  const [possuiMedidaProtetiva, setPossuiMedidaProtetiva] = useState(false);
  const [permissaoMicrofone, setPermissaoMicrofone] = useState(true);
  const [permissaoLocalizacao, setPermissaoLocalizacao] = useState(true);

  const [error, setError] = useState<ApiError | string | string[] | null>(null);

  useEffect(() => {
    if (params.perfil && PERFIS.includes(params.perfil)) {
      setPerfil(params.perfil);
    }
  }, [params.perfil]);

  const handlePreencherDemo = () => {
    const sufixo = Math.floor(100 + Math.random() * 899);
    setNome(`Maria da Silva ${sufixo}`);
    setEmail(`maria.silva${sufixo}@valky.com.br`);
    setCpf(gerarCpfValidoDemo());
    setTelefone('(11) 98765-4321');
    setSenha('Valky@2026');
    setPerfil('USUARIA');
    setCodigoBo(`BO-2026-${sufixo}90`);
    setPinDisfarce('1901');
    setPossuiMedidaProtetiva(false);
    setPermissaoMicrofone(true);
    setPermissaoLocalizacao(true);
    setError(null);
  };

  const handleSignup = async () => {
    setError(null);

    const errosValidacao = validarFormularioCadastro({
      nome,
      email,
      cpf,
      telefone,
      senha,
      perfil,
      codigoBo: perfil === 'USUARIA' ? codigoBo : undefined,
      pinDisfarce: perfil === 'USUARIA' ? pinDisfarce : undefined,
    });

    if (errosValidacao.length > 0) {
      setError(errosValidacao);
      return;
    }

    try {
      await registrar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cpf: normalizarDigitos(cpf),
        telefone: normalizarDigitos(telefone),
        senha,
        perfil,
        codigoBo: codigoBo.trim() ? codigoBo.trim() : null,
        pinDisfarce: pinDisfarce.trim() ? pinDisfarce.trim() : null,
        possuiMedidaProtetiva,
        permissaoMicrofone,
        permissaoLocalizacao,
      });

      router.replace('/' as never);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Erro inesperado ao realizar o cadastro na API.');
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
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.eyebrow}>CADASTRO CITIZENTECH • ORACLE</Text>
            <Text style={styles.title}>Criar conta de proteção</Text>
          </View>
          <Pressable style={styles.demoBtn} onPress={handlePreencherDemo}>
            <Text style={styles.demoBtnText}>⚡ Dados Demo</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Diferente dos apps tradicionais que exigem a medida protetiva deferida
          pelo juiz, o Valky libera o botão de pânico silencioso desde o registro
          do Boletim de Ocorrência (BO).
        </Text>

        <View style={[styles.card, ValkyShadows.card]}>
          <ErrorBanner error={error} onDismiss={() => setError(null)} />

          <Text style={styles.sectionTitle}>1. Perfil no Ecossistema</Text>
          <View style={styles.perfilGroup}>
            {PERFIS.map((p) => {
              const ativo = perfil === p;
              const meta = ValkyPerfilMeta[p];
              return (
                <Pressable
                  key={p}
                  onPress={() => setPerfil(p)}
                  style={[
                    styles.perfilOption,
                    ativo && styles.perfilOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.perfilTitle,
                      ativo && styles.perfilTitleActive,
                    ]}
                  >
                    {meta.label}
                  </Text>
                  <Text
                    style={[
                      styles.perfilDesc,
                      ativo && styles.perfilDescActive,
                    ]}
                  >
                    {meta.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>2. Dados Pessoais</Text>

          <Text style={styles.label}>Nome completo *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Maria da Silva"
            placeholderTextColor="#B09DA2"
          />

          <Text style={styles.label}>E-mail *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="maria.silva@email.com"
            placeholderTextColor="#B09DA2"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>CPF (11 dígitos válidos) *</Text>
            <Pressable onPress={() => setCpf(gerarCpfValidoDemo())}>
              <Text style={styles.cpfGenLink}>Gerar CPF válido</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={(v) => setCpf(formatarCpf(v))}
            placeholder="000.000.000-00"
            placeholderTextColor="#B09DA2"
            keyboardType="numeric"
            maxLength={14}
          />

          <Text style={styles.label}>Telefone com DDD *</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={(v) => setTelefone(formatarTelefone(v))}
            placeholder="(11) 98765-4321"
            placeholderTextColor="#B09DA2"
            keyboardType="phone-pad"
            maxLength={15}
          />

          <Text style={styles.label}>
            Senha forte (mín. 8 caracteres, maiúscula, minúscula e número) *
          </Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Ex.: Valky@2026"
            placeholderTextColor="#B09DA2"
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.sectionTitle}>
            3. Ficha de Proteção e Gatilho da Calculadora
          </Text>

          <Text style={styles.label}>
            Número do Boletim de Ocorrência (BO){' '}
            {perfil === 'USUARIA' ? '*' : '(opcional)'}
          </Text>
          <TextInput
            style={styles.input}
            value={codigoBo}
            onChangeText={setCodigoBo}
            placeholder="Ex.: BO-2026-000123"
            placeholderTextColor="#B09DA2"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            PIN da Calculadora Disfarçada (4 a 8 dígitos numéricos)
          </Text>
          <TextInput
            style={styles.input}
            value={pinDisfarce}
            onChangeText={(v) =>
              setPinDisfarce(normalizarDigitos(v).slice(0, 8))
            }
            placeholder="Ex.: 1901"
            placeholderTextColor="#B09DA2"
            keyboardType="numeric"
            maxLength={8}
          />
          <Text style={styles.helperText}>
            Ao digitar este código na calculadora e pressionar &quot;=&quot;, o
            alerta silencioso será enviado imediatamente para a polícia.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>
                Já possui Medida Protetiva deferida?
              </Text>
              <Text style={styles.switchSubtitle}>
                O Valky protege mesmo enquanto você aguarda a decisão judicial.
              </Text>
            </View>
            <Switch
              value={possuiMedidaProtetiva}
              onValueChange={setPossuiMedidaProtetiva}
              trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>
                Permissão prévia de Localização GPS
              </Text>
              <Text style={styles.switchSubtitle}>
                Evita pop-ups do celular no momento de perigo.
              </Text>
            </View>
            <Switch
              value={permissaoLocalizacao}
              onValueChange={setPermissaoLocalizacao}
              trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>
                Permissão prévia de Microfone (Áudio contínuo)
              </Text>
              <Text style={styles.switchSubtitle}>
                Libera gravação de trechos de áudio durante o alerta.
              </Text>
            </View>
            <Switch
              value={permissaoMicrofone}
              onValueChange={setPermissaoMicrofone}
              trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
            />
          </View>

          <Pressable
            style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={ValkyColors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>
                Concluir Cadastro e Emitir JWT →
              </Text>
            )}
          </Pressable>

          <Link
            href={{
              pathname: '/login' as never,
              params: email ? { email } : undefined,
            }}
            asChild
          >
            <Pressable style={styles.backToLogin}>
              <Text style={styles.backToLoginText}>
                Já possui uma conta? Fazer login
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
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
    paddingBottom: 56,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    color: ValkyColors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 25,
    fontWeight: 'bold',
  },
  demoBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },
  demoBtnText: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },
  card: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: ValkyColors.border,
  },
  sectionTitle: {
    color: ValkyColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 12,
  },
  perfilGroup: {
    gap: 8,
    marginBottom: 14,
  },
  perfilOption: {
    borderWidth: 1,
    borderColor: ValkyColors.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: ValkyColors.background,
  },
  perfilOptionActive: {
    borderColor: ValkyColors.primary,
    backgroundColor: ValkyColors.surfaceMuted,
  },
  perfilTitle: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  perfilTitleActive: {
    color: ValkyColors.primaryDark,
  },
  perfilDesc: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  perfilDescActive: {
    color: ValkyColors.textSecondary,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cpfGenLink: {
    color: ValkyColors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: ValkyColors.background,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: ValkyColors.textPrimary,
    marginBottom: 10,
  },
  helperText: {
    color: ValkyColors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: ValkyColors.border,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    color: ValkyColors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  switchSubtitle: {
    color: ValkyColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: ValkyColors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  backToLogin: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 6,
  },
  backToLoginText: {
    color: ValkyColors.secondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
