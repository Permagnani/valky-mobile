import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ErrorBanner, SuccessBanner } from '@/components/status-feedback';
import {
  ValkyColors,
  ValkyPerfilMeta,
  ValkyShadows,
} from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api-client';
import { UserService } from '@/services/user-service';
import {
  formatarCpf,
  formatarTelefone,
  normalizarDigitos,
  validarSenhaForte,
} from '@/utils/validators';

export default function ProfileScreen() {
  const {
    usuario,
    isAuthenticated,
    pinDisfarceSessao,
    logout,
    atualizarUsuarioSessao,
    recarregarPerfil,
  } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [codigoBo, setCodigoBo] = useState('');
  const [pinDisfarce, setPinDisfarce] = useState('');
  const [possuiMedidaProtetiva, setPossuiMedidaProtetiva] = useState(false);
  const [permissaoMicrofone, setPermissaoMicrofone] = useState(true);
  const [permissaoLocalizacao, setPermissaoLocalizacao] = useState(true);

  // Troca de senha (PATCH /api/usuarios/{id}/senha)
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [error, setError] = useState<ApiError | string | string[] | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome);
      setEmail(usuario.email);
      setTelefone(formatarTelefone(usuario.telefone));
      setCodigoBo(usuario.codigoBo ?? '');
      setPinDisfarce(pinDisfarceSessao);
      setPossuiMedidaProtetiva(usuario.possuiMedidaProtetiva);
      setPermissaoMicrofone(usuario.permissaoMicrofone);
      setPermissaoLocalizacao(usuario.permissaoLocalizacao);
    }
  }, [usuario, pinDisfarceSessao]);

  if (!isAuthenticated || !usuario) {
    return (
      <View style={styles.guardContainer}>
        <View style={[styles.guardCard, ValkyShadows.card]}>
          <Text style={styles.guardBadge}>ROTA PROTEGIDA • JWT</Text>
          <Text style={styles.guardTitle}>Perfil e Ficha de Proteção</Text>
          <Text style={styles.guardDesc}>
            Faça login para consultar seu diagnóstico de prontidão, atualizar seu
            Boletim de Ocorrência, configurar o PIN da calculadora ou encerrar a
            sessão.
          </Text>
          <Link
            href={{
              pathname: '/login' as never,
              params: { redirect: '/profile' },
            }}
            asChild
          >
            <Pressable style={styles.guardBtn}>
              <Text style={styles.guardBtnText}>Ir para Login →</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  const handleSalvarPerfil = async () => {
    setError(null);
    setSuccessMsg(null);

    if (nome.trim().length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (
      usuario.perfil === 'USUARIA' &&
      (!codigoBo || codigoBo.trim().length === 0)
    ) {
      setError('O número do Boletim de Ocorrência (BO) é obrigatório.');
      return;
    }
    if (
      pinDisfarce.trim().length > 0 &&
      !/^\d{4,8}$/.test(pinDisfarce.trim())
    ) {
      setError('O PIN da calculadora deve conter entre 4 e 8 dígitos numéricos.');
      return;
    }

    setSavingProfile(true);
    try {
      const atualizado = await UserService.atualizarUsuario(usuario.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: normalizarDigitos(telefone),
        perfil: usuario.perfil,
        codigoBo: codigoBo.trim() ? codigoBo.trim() : null,
        pinDisfarce: pinDisfarce.trim() ? pinDisfarce.trim() : null,
        possuiMedidaProtetiva,
        permissaoMicrofone,
        permissaoLocalizacao,
        ativo: true,
      });

      atualizarUsuarioSessao(atualizado, pinDisfarce.trim());
      setSuccessMsg(
        'Dados cadastrais e configurações de proteção atualizados no Oracle (PUT /api/usuarios)!'
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Não foi possível atualizar o perfil.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAlterarSenha = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!senhaAtual) {
      setError('Informe a sua senha atual.');
      return;
    }
    const errosNova = validarSenhaForte(novaSenha);
    if (errosNova.length > 0) {
      setError(errosNova);
      return;
    }

    setSavingPassword(true);
    try {
      await UserService.alterarSenha(usuario.id, {
        senhaAtual,
        novaSenha,
      });
      setSenhaAtual('');
      setNovaSenha('');
      setSuccessMsg(
        'Senha alterada com segurança (PATCH /api/usuarios/{id}/senha)!'
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Erro ao alterar a senha.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login' as never);
  };

  const handleExcluirConta = async () => {
    setError(null);
    setDeletingAccount(true);
    try {
      await UserService.excluirUsuario(usuario.id);
      logout();
      router.replace('/login' as never);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError('Erro ao excluir a conta.');
      }
    } finally {
      setDeletingAccount(false);
      setConfirmDelete(false);
    }
  };

  const perfilMeta = ValkyPerfilMeta[usuario.perfil] ?? ValkyPerfilMeta.USUARIA;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>CONTA AUTENTICADA • JWT</Text>
            <Text style={styles.title}>{usuario.nome}</Text>
            <Text style={styles.cpfSubtitle}>
              CPF: {formatarCpf(usuario.cpf)} • {perfilMeta.badge}
            </Text>
          </View>

          <Pressable style={styles.logoutTopBtn} onPress={handleLogout}>
            <Text style={styles.logoutTopText}>Sair (Logout)</Text>
          </Pressable>
        </View>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />
        <SuccessBanner
          message={successMsg}
          onDismiss={() => setSuccessMsg(null)}
        />

        {/* Card de Diagnóstico de Prontidão retornado pela API */}
        <View
          style={[
            styles.readinessCard,
            usuario.prontaParaAlertaSilencioso
              ? styles.readinessReady
              : styles.readinessPending,
          ]}
        >
          <View style={styles.readinessHeader}>
            <Text
              style={[
                styles.readinessTitle,
                usuario.prontaParaAlertaSilencioso
                  ? styles.readinessTitleReady
                  : styles.readinessTitlePending,
              ]}
            >
              {usuario.prontaParaAlertaSilencioso
                ? '✓ Alerta Silencioso 100% Pronto'
                : '⚠ Configuração de Alerta com Pendências'}
            </Text>

            <Pressable onPress={recarregarPerfil}>
              <Text style={styles.syncLink}>↻ Validar (/api/auth/me)</Text>
            </Pressable>
          </View>

          {usuario.prontaParaAlertaSilencioso ? (
            <Text style={styles.readinessDesc}>
              Seu BO ({usuario.codigoBo}), PIN da calculadora, permissões de
              microfone/GPS e rede de confiança (
              {usuario.contatosConfianca.length} contato(s)) estão ativos.
            </Text>
          ) : (
            usuario.pendenciasConfiguracao.map((pend, idx) => (
              <Text key={`${idx}-${pend}`} style={styles.pendingItem}>
                • {pend}
              </Text>
            ))
          )}
        </View>

        {/* Formulário PUT /api/usuarios/{id} */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>
            Dados Cadastrais e Ficha de Segurança (PUT)
          </Text>

          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={(v) => setTelefone(formatarTelefone(v))}
            keyboardType="phone-pad"
            maxLength={15}
          />

          <Text style={styles.label}>
            Número do Boletim de Ocorrência (BO)
          </Text>
          <TextInput
            style={styles.input}
            value={codigoBo}
            onChangeText={setCodigoBo}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            PIN da Calculadora Disfarçada (4 a 8 dígitos)
          </Text>
          <TextInput
            style={styles.input}
            value={pinDisfarce}
            onChangeText={(v) =>
              setPinDisfarce(normalizarDigitos(v).slice(0, 8))
            }
            keyboardType="numeric"
            maxLength={8}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              Possui Medida Protetiva deferida
            </Text>
            <Switch
              value={possuiMedidaProtetiva}
              onValueChange={setPossuiMedidaProtetiva}
              trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              Permissão prévia de Localização GPS
            </Text>
            <Switch
              value={permissaoLocalizacao}
              onValueChange={setPermissaoLocalizacao}
              trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              Permissão prévia de Microfone
            </Text>
            <Switch
              value={permissaoMicrofone}
              onValueChange={setPermissaoMicrofone}
              trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
            />
          </View>

          <Pressable
            style={styles.primaryBtn}
            onPress={handleSalvarPerfil}
            disabled={savingProfile}
          >
            {savingProfile ? (
              <ActivityIndicator size="small" color={ValkyColors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>
                Salvar Alterações Cadastrais (PUT)
              </Text>
            )}
          </Pressable>
        </View>

        {/* Formulário PATCH /api/usuarios/{id}/senha */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>
            Alteração Segura de Senha (PATCH)
          </Text>

          <Text style={styles.label}>Senha atual</Text>
          <TextInput
            style={styles.input}
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureTextEntry
            placeholder="Digite sua senha atual"
            placeholderTextColor="#B09DA2"
          />

          <Text style={styles.label}>
            Nova senha forte (mín. 8 caracteres, maiúscula, minúscula e número)
          </Text>
          <TextInput
            style={styles.input}
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
            placeholder="Digite a nova senha"
            placeholderTextColor="#B09DA2"
          />

          <Pressable
            style={styles.secondaryBtn}
            onPress={handleAlterarSenha}
            disabled={savingPassword}
          >
            {savingPassword ? (
              <ActivityIndicator size="small" color={ValkyColors.primary} />
            ) : (
              <Text style={styles.secondaryBtnText}>
                Atualizar Senha (PATCH)
              </Text>
            )}
          </Pressable>
        </View>

        {/* Zona de Sessão e Exclusão de Conta (DELETE /api/usuarios/{id}) */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>Sessão e Privacidade</Text>

          <Pressable style={styles.logoutFullBtn} onPress={handleLogout}>
            <Text style={styles.logoutFullText}>
              Encerrar Sessão (Logout e Bloquear Rotas Protegidas)
            </Text>
          </Pressable>

          {!confirmDelete ? (
            <Pressable
              style={styles.deleteAccountTrigger}
              onPress={() => setConfirmDelete(true)}
            >
              <Text style={styles.deleteAccountTriggerText}>
                Excluir minha conta e dados do servidor (DELETE)
              </Text>
            </Pressable>
          ) : (
            <View style={styles.confirmDeleteBox}>
              <Text style={styles.confirmDeleteWarn}>
                Tem certeza? Esta ação removerá seu usuário e contatos de
                confiança da tabela TB_VALKY_USUARIOS via DELETE /api/usuarios/
                {usuario.id}.
              </Text>
              <View style={styles.confirmDeleteActions}>
                <Pressable
                  style={styles.cancelDeleteBtn}
                  onPress={() => setConfirmDelete(false)}
                >
                  <Text style={styles.cancelDeleteText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmDeleteBtn}
                  onPress={handleExcluirConta}
                  disabled={deletingAccount}
                >
                  <Text style={styles.confirmDeleteText}>
                    {deletingAccount ? 'Excluindo...' : 'Confirmar DELETE'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ValkyColors.background,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 52,
  },
  guardContainer: {
    flex: 1,
    backgroundColor: ValkyColors.background,
    justifyContent: 'center',
    padding: 22,
  },
  guardCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    alignItems: 'center',
  },
  guardBadge: {
    color: ValkyColors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  guardTitle: {
    color: ValkyColors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  guardDesc: {
    color: ValkyColors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  guardBtn: {
    backgroundColor: ValkyColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  guardBtnText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eyebrow: {
    color: ValkyColors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cpfSubtitle: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  logoutTopBtn: {
    backgroundColor: ValkyColors.dangerBg,
    borderWidth: 1,
    borderColor: ValkyColors.dangerBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  logoutTopText: {
    color: ValkyColors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  readinessCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  readinessReady: {
    backgroundColor: ValkyColors.successBg,
    borderColor: ValkyColors.successBorder,
  },
  readinessPending: {
    backgroundColor: ValkyColors.warningBg,
    borderColor: ValkyColors.warningBorder,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  readinessTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  readinessTitleReady: {
    color: ValkyColors.success,
  },
  readinessTitlePending: {
    color: ValkyColors.warning,
  },
  syncLink: {
    color: ValkyColors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  readinessDesc: {
    color: ValkyColors.success,
    fontSize: 12,
    lineHeight: 18,
  },
  pendingItem: {
    color: ValkyColors.warning,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  card: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    color: ValkyColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: ValkyColors.textPrimary,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: ValkyColors.border,
  },
  switchLabel: {
    color: ValkyColors.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutFullBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutFullText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteAccountTrigger: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteAccountTriggerText: {
    color: ValkyColors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmDeleteBox: {
    backgroundColor: ValkyColors.dangerBg,
    borderColor: ValkyColors.dangerBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  confirmDeleteWarn: {
    color: ValkyColors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  confirmDeleteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelDeleteBtn: {
    flex: 1,
    backgroundColor: ValkyColors.white,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelDeleteText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: ValkyColors.danger,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
