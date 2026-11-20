import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ErrorBanner,
  LoadingView,
  SuccessBanner,
} from '@/components/status-feedback';
import { ValkyColors, ValkyShadows } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { useContacts } from '@/hooks/use-contacts';
import { ApiError } from '@/services/api-client';
import { ContatoConfiancaResponse } from '@/types/api';
import {
  formatarTelefone,
  normalizarDigitos,
  validarContatoConfianca,
} from '@/utils/validators';

const VINCULOS_SUGERIDOS = [
  'Mãe',
  'Irmã',
  'Amiga',
  'Advogada',
  'Vizinha',
  'Pai',
];

export default function ContactsScreen() {
  const { usuario, isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ action?: string }>();

  const {
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
  } = useContacts();

  // Estado do Modal de Criação / Edição (Create & Update)
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] =
    useState<ContatoConfiancaResponse | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [parentesco, setParentesco] = useState('Mãe');
  const [notificarPorSms, setNotificarPorSms] = useState(true);
  const [notificarPorApp, setNotificarPorApp] = useState(true);
  const [formError, setFormError] = useState<
    ApiError | string | string[] | null
  >(null);

  useEffect(() => {
    if (isAuthenticated && params.action === 'new') {
      setEditingContact(null);
      setNome('');
      setTelefone('');
      setEmail('');
      setParentesco('Mãe');
      setNotificarPorSms(true);
      setNotificarPorApp(true);
      setFormError(null);
      setModalVisible(true);
    }
  }, [isAuthenticated, params.action]);

  if (!isAuthenticated || !usuario) {
    return (
      <View style={styles.guardContainer}>
        <View style={[styles.guardCard, ValkyShadows.card]}>
          <Text style={styles.guardBadge}>ROTA PROTEGIDA • JWT</Text>
          <Text style={styles.guardTitle}>
            Acesso restrito à Rede de Confiança
          </Text>
          <Text style={styles.guardDesc}>
            Para cadastrar, editar ou remover pessoas de confiança vinculadas ao
            seu Boletim de Ocorrência, faça login na sua conta Valky.
          </Text>
          <Link
            href={{
              pathname: '/login' as never,
              params: { redirect: '/contacts' },
            }}
            asChild
          >
            <Pressable style={styles.guardBtn}>
              <Text style={styles.guardBtnText}>Ir para Tela de Login →</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  const abrirModalNovo = () => {
    setEditingContact(null);
    setNome('');
    setTelefone('');
    setEmail('');
    setParentesco('Mãe');
    setNotificarPorSms(true);
    setNotificarPorApp(true);
    setFormError(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (contato: ContatoConfiancaResponse) => {
    setEditingContact(contato);
    setNome(contato.nome);
    setTelefone(formatarTelefone(contato.telefone));
    setEmail(contato.email ?? '');
    setParentesco(contato.parentesco);
    setNotificarPorSms(contato.notificarPorSms);
    setNotificarPorApp(contato.notificarPorApp);
    setFormError(null);
    setModalVisible(true);
  };

  const handleSalvarContato = async () => {
    setFormError(null);

    const errosValidacao = validarContatoConfianca({
      nome,
      telefone,
      email,
      parentesco,
      notificarPorSms,
      notificarPorApp,
    });

    if (errosValidacao.length > 0) {
      setFormError(errosValidacao);
      return;
    }

    try {
      await salvarContato(
        {
          nome: nome.trim(),
          telefone: normalizarDigitos(telefone),
          email: email.trim() ? email.trim().toLowerCase() : null,
          parentesco: parentesco.trim(),
          notificarPorSms,
          notificarPorApp,
        },
        editingContact?.id
      );
      setModalVisible(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err);
      } else {
        setFormError('Não foi possível salvar o contato de confiança.');
      }
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.eyebrow}>
              CRUD COMPLETO • HOOK useContacts()
            </Text>
            <Text style={styles.title}>Pessoas de Confiança</Text>
          </View>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{contatos.length} / 5</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Quando o alerta silencioso é acionado na calculadora, sua rede de
          confiança acompanha o andamento da viatura policial em tempo real
          (recebida, a caminho, no local e encerrada).
        </Text>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />
        <SuccessBanner
          message={successMsg}
          onDismiss={() => setSuccessMsg(null)}
        />

        <View style={styles.actionRow}>
          <Pressable
            style={[
              styles.addBtn,
              contatos.length >= 5 && styles.addBtnDisabled,
            ]}
            onPress={abrirModalNovo}
          >
            <Text style={styles.addBtnText}>
              + Adicionar Pessoa de Confiança
            </Text>
          </Pressable>

          <Pressable
            style={styles.refreshBtn}
            onPress={carregarContatos}
            disabled={loading}
          >
            <Text style={styles.refreshBtnText}>↻ Atualizar</Text>
          </Pressable>
        </View>

        {loading ? (
          <LoadingView label="Buscando contatos no Oracle Database..." />
        ) : contatos.length === 0 ? (
          <View style={[styles.emptyCard, ValkyShadows.card]}>
            <Text style={styles.emptyIcon}>♥</Text>
            <Text style={styles.emptyTitle}>
              Nenhum contato de confiança cadastrado
            </Text>
            <Text style={styles.emptyDesc}>
              Cadastre pelo menos 1 pessoa de confiança (familiar, amiga ou
              advogada) para que seu diagnóstico de prontidão de alerta fique
              100% ativo.
            </Text>
            <Pressable style={styles.emptyBtn} onPress={abrirModalNovo}>
              <Text style={styles.emptyBtnText}>
                Cadastrar primeiro contato
              </Text>
            </Pressable>
          </View>
        ) : (
          contatos.map((contato) => (
            <View
              key={contato.id}
              style={[styles.contactCard, ValkyShadows.card]}
            >
              <View style={styles.contactTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {contato.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.contactName}>{contato.nome}</Text>
                    <View style={styles.kinshipBadge}>
                      <Text style={styles.kinshipText}>
                        {contato.parentesco}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.contactPhone}>
                    Tel: {formatarTelefone(contato.telefone)}
                  </Text>
                  {contato.email ? (
                    <Text style={styles.contactEmail}>{contato.email}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.channelsRow}>
                <View
                  style={[
                    styles.channelPill,
                    contato.notificarPorSms && styles.channelPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.channelText,
                      contato.notificarPorSms && styles.channelTextActive,
                    ]}
                  >
                    {contato.notificarPorSms ? '✓ SMS Ativo' : '✕ Sem SMS'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.channelPill,
                    contato.notificarPorApp && styles.channelPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.channelText,
                      contato.notificarPorApp && styles.channelTextActive,
                    ]}
                  >
                    {contato.notificarPorApp
                      ? '✓ Notificação App'
                      : '✕ Sem App'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => abrirModalEditar(contato)}
                >
                  <Text style={styles.editBtnText}>✎ Editar (PUT)</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => removerContato(contato)}
                  disabled={deletingId === contato.id}
                >
                  {deletingId === contato.id ? (
                    <ActivityIndicator
                      size="small"
                      color={ValkyColors.danger}
                    />
                  ) : (
                    <Text style={styles.deleteBtnText}>✕ Remover (DELETE)</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para Create (POST) e Update (PUT) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact
                  ? 'Editar Contato de Confiança'
                  : 'Novo Contato de Confiança'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>Fechar ✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ErrorBanner
                error={formError}
                onDismiss={() => setFormError(null)}
              />

              <Text style={styles.label}>Nome da pessoa de confiança *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Helena da Silva"
                placeholderTextColor="#B09DA2"
              />

              <Text style={styles.label}>Vínculo / Parentesco *</Text>
              <View style={styles.chipsRow}>
                {VINCULOS_SUGERIDOS.map((v) => {
                  const ativo = parentesco === v;
                  return (
                    <Pressable
                      key={v}
                      onPress={() => setParentesco(v)}
                      style={[styles.chip, ativo && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, ativo && styles.chipTextActive]}
                      >
                        {v}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                style={styles.input}
                value={parentesco}
                onChangeText={setParentesco}
                placeholder="Outro vínculo (ex.: Prima, Colega)"
                placeholderTextColor="#B09DA2"
              />

              <Text style={styles.label}>Telefone Celular com DDD *</Text>
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={(v) => setTelefone(formatarTelefone(v))}
                placeholder="(11) 99876-5432"
                placeholderTextColor="#B09DA2"
                keyboardType="phone-pad"
                maxLength={15}
              />

              <Text style={styles.label}>E-mail (opcional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="helena@email.com"
                placeholderTextColor="#B09DA2"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Receber alerta imediato por SMS
                </Text>
                <Switch
                  value={notificarPorSms}
                  onValueChange={setNotificarPorSms}
                  trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Acompanhar status da viatura no App
                </Text>
                <Switch
                  value={notificarPorApp}
                  onValueChange={setNotificarPorApp}
                  trackColor={{ false: '#D8BEC3', true: ValkyColors.primary }}
                />
              </View>

              <Pressable
                style={[styles.saveBtn, saving && styles.addBtnDisabled]}
                onPress={handleSalvarContato}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={ValkyColors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingContact
                      ? 'Salvar Alterações (PUT)'
                      : 'Cadastrar Contato (POST)'}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 48,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTextCol: {
    flex: 1,
  },
  eyebrow: {
    color: ValkyColors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 26,
    fontWeight: 'bold',
  },
  counterBadge: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  addBtn: {
    flex: 1,
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.65,
  },
  addBtnText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  refreshBtn: {
    backgroundColor: ValkyColors.surface,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 34,
    color: ValkyColors.secondary,
    marginBottom: 10,
  },
  emptyTitle: {
    color: ValkyColors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  emptyBtnText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  contactCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    marginBottom: 12,
  },
  contactTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ValkyColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: ValkyColors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  contactName: {
    color: ValkyColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  kinshipBadge: {
    backgroundColor: ValkyColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  kinshipText: {
    color: ValkyColors.secondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  contactPhone: {
    color: ValkyColors.textSecondary,
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },
  contactEmail: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  channelsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  channelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: ValkyColors.background,
    borderWidth: 1,
    borderColor: ValkyColors.border,
  },
  channelPillActive: {
    backgroundColor: ValkyColors.successBg,
    borderColor: ValkyColors.successBorder,
  },
  channelText: {
    fontSize: 11,
    color: ValkyColors.textMuted,
    fontWeight: '600',
  },
  channelTextActive: {
    color: ValkyColors.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: ValkyColors.border,
    paddingTop: 10,
  },
  editBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  editBtnText: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: ValkyColors.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  deleteBtnText: {
    color: ValkyColors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(38, 22, 27, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ValkyColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: ValkyColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    color: ValkyColors.secondary,
    fontSize: 14,
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: ValkyColors.white,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: ValkyColors.primary,
    borderColor: ValkyColors.primary,
  },
  chipText: {
    color: ValkyColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: ValkyColors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: ValkyColors.border,
  },
  switchLabel: {
    color: ValkyColors.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  saveBtn: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  saveBtnText: {
    color: ValkyColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
