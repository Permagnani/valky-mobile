import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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

import {
  ErrorBanner,
  LoadingView,
  SuccessBanner,
} from '@/components/status-feedback';
import {
  ValkyColors,
  ValkyShadows,
  ValkyStatusMeta,
} from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { useAlerts } from '@/hooks/use-alerts';
import {
  AlertaResponse,
  AtualizacaoStatusResponse,
  StatusAlerta,
} from '@/types/api';

const STATUS_LIST: StatusAlerta[] = [
  'ABERTO',
  'VIATURA_A_CAMINHO',
  'NO_LOCAL',
  'ENCERRADO',
];

export default function AlertsScreen() {
  const { usuario, isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ alertaId?: string }>();
  const parsedAlertaId = params.alertaId ? Number(params.alertaId) : undefined;

  const {
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
    salvarAlerta,
    excluirAlerta,
    salvarStatus,
    excluirStatus,
  } = useAlerts(
    parsedAlertaId && !Number.isNaN(parsedAlertaId) ? parsedAlertaId : undefined
  );

  // Modal de Alerta (Create POST /api/alertas e Update PUT /api/alertas/{id})
  const [alertaModalOpen, setAlertaModalOpen] = useState(false);
  const [editingAlerta, setEditingAlerta] = useState<AlertaResponse | null>(
    null
  );
  const [codigoBoInput, setCodigoBoInput] = useState('');
  const [latInput, setLatInput] = useState('-23.550520');
  const [lngInput, setLngInput] = useState('-46.633308');
  const [statusAlertaInput, setStatusAlertaInput] =
    useState<StatusAlerta>('ABERTO');

  // Modal de Histórico de Status (Create POST e Update PUT /api/atualizacoes-status)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatusItem, setEditingStatusItem] =
    useState<AtualizacaoStatusResponse | null>(null);
  const [novoStatus, setNovoStatus] =
    useState<StatusAlerta>('VIATURA_A_CAMINHO');
  const [observacaoInput, setObservacaoInput] = useState(
    'Viatura M-190 despachada para as coordenadas GPS da usuária.'
  );
  const [responsavelInput, setResponsavelInput] = useState(
    'Central 190 • COPOM'
  );

  if (!isAuthenticated || !usuario) {
    return (
      <View style={styles.guardContainer}>
        <View style={[styles.guardCard, ValkyShadows.card]}>
          <Text style={styles.guardBadge}>ROTA PROTEGIDA • JWT</Text>
          <Text style={styles.guardTitle}>
            Central de Alertas e Andamento Policial
          </Text>
          <Text style={styles.guardDesc}>
            Autentique-se para acionar ocorrências, acompanhar o deslocamento da
            viatura e consultar o histórico em tempo real na Valky.Api.
          </Text>
          <Link
            href={{
              pathname: '/login' as never,
              params: { redirect: '/alerts' },
            }}
            asChild
          >
            <Pressable style={styles.guardBtn}>
              <Text style={styles.guardBtnText}>Fazer Login →</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  // ==================== OPERAÇÕES CRUD: ALERTAS ====================

  const abrirModalNovoAlerta = () => {
    setEditingAlerta(null);
    setCodigoBoInput(usuario.codigoBo || 'BO-2026-00190');
    setLatInput('-23.550520');
    setLngInput('-46.633308');
    setStatusAlertaInput('ABERTO');
    setAlertaModalOpen(true);
  };

  const abrirModalEditarAlerta = (alerta: AlertaResponse) => {
    setEditingAlerta(alerta);
    setCodigoBoInput(alerta.codigoBo);
    setLatInput(String(alerta.latitude));
    setLngInput(String(alerta.longitude));
    setStatusAlertaInput(alerta.status);
    setAlertaModalOpen(true);
  };

  const handleSalvarAlerta = async () => {
    const lat = Number(latInput.replace(',', '.'));
    const lng = Number(lngInput.replace(',', '.'));

    if (!codigoBoInput.trim()) {
      setError('O número do Boletim de Ocorrência (BO) é obrigatório.');
      return;
    }
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setError('A latitude deve ser um número entre -90 e 90.');
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      setError('A longitude deve ser um número entre -180 e 180.');
      return;
    }

    const ok = await salvarAlerta(
      {
        codigoBo: codigoBoInput.trim(),
        latitude: lat,
        longitude: lng,
        status: editingAlerta ? statusAlertaInput : 'ABERTO',
      },
      editingAlerta?.id
    );

    if (ok) {
      setAlertaModalOpen(false);
    }
  };

  // ==================== OPERAÇÕES CRUD: ATUALIZAÇÕES DE STATUS ====================

  const abrirModalNovoStatus = (statusSugerido?: StatusAlerta) => {
    if (!selectedAlerta) return;
    setEditingStatusItem(null);
    const proximo: StatusAlerta =
      statusSugerido ??
      (selectedAlerta.status === 'ABERTO'
        ? 'VIATURA_A_CAMINHO'
        : selectedAlerta.status === 'VIATURA_A_CAMINHO'
        ? 'NO_LOCAL'
        : 'ENCERRADO');

    setNovoStatus(proximo);
    setObservacaoInput(ValkyStatusMeta[proximo].description);
    setResponsavelInput(
      usuario.perfil === 'POLICIA'
        ? usuario.nome
        : 'Central 190 • Viatura M-204'
    );
    setStatusModalOpen(true);
  };

  const abrirModalEditarStatus = (item: AtualizacaoStatusResponse) => {
    setEditingStatusItem(item);
    setNovoStatus(item.status);
    setObservacaoInput(item.observacao ?? '');
    setResponsavelInput(item.responsavel);
    setStatusModalOpen(true);
  };

  const handleSalvarStatus = async () => {
    if (!selectedAlerta) return;

    if (!responsavelInput.trim()) {
      setError('O responsável pela atualização de status é obrigatório.');
      return;
    }

    const ok = await salvarStatus(
      {
        alertaId: selectedAlerta.id,
        status: novoStatus,
        observacao: observacaoInput.trim() || null,
        responsavel: responsavelInput.trim(),
      },
      editingStatusItem?.id
    );

    if (ok) {
      setStatusModalOpen(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          CENTRAL 190 • HOOK useAlerts() & useLocalSearchParams()
        </Text>
        <Text style={styles.title}>Alertas e Andamento Policial</Text>
        <Text style={styles.subtitle}>
          Gerencie os alertas disparados (`/api/alertas`) e acompanhe cada etapa
          do atendimento da viatura (`/api/atualizacoes-status`).
        </Text>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />
        <SuccessBanner
          message={successMsg}
          onDismiss={() => setSuccessMsg(null)}
        />

        <View style={styles.topActions}>
          <Pressable style={styles.triggerBtn} onPress={abrirModalNovoAlerta}>
            <Text style={styles.triggerBtnText}>
              + Acionar Novo Alerta (POST)
            </Text>
          </Pressable>

          <Pressable
            style={styles.refreshBtn}
            onPress={carregarAlertas}
            disabled={loadingAlertas}
          >
            <Text style={styles.refreshBtnText}>↻ Sincronizar</Text>
          </Pressable>
        </View>

        {loadingAlertas ? (
          <LoadingView label="Consultando alertas na Valky.Api..." />
        ) : alertas.length === 0 ? (
          <View style={[styles.emptyCard, ValkyShadows.card]}>
            <Text style={styles.emptyTitle}>Nenhum alerta registrado</Text>
            <Text style={styles.emptyDesc}>
              Você pode disparar um alerta silencioso digitando seu PIN na
              Calculadora Disfarçada ou tocando em &quot;+ Acionar Novo
              Alerta&quot; acima.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Ocorrências Registradas ({alertas.length})
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.alertListScroll}
            >
              {alertas.map((alerta) => {
                const isSelected = selectedAlerta?.id === alerta.id;
                const meta =
                  ValkyStatusMeta[alerta.status] ?? ValkyStatusMeta.ABERTO;

                return (
                  <Pressable
                    key={alerta.id}
                    onPress={() => setSelectedAlerta(alerta)}
                    style={[
                      styles.alertMiniCard,
                      isSelected && styles.alertMiniCardSelected,
                    ]}
                  >
                    <View style={styles.miniHeader}>
                      <Text style={styles.miniId}>Alerta #{alerta.id}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: meta.bg,
                            borderColor: meta.border,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.statusBadgeText, { color: meta.color }]}
                        >
                          {meta.shortLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.miniBo}>BO: {alerta.codigoBo}</Text>
                    <Text style={styles.miniCoords}>
                      GPS: {alerta.latitude}, {alerta.longitude}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedAlerta && (
              <View style={[styles.detailCard, ValkyShadows.card]}>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailEyebrow}>
                      OCORRÊNCIA SELECIONADA #{selectedAlerta.id}
                    </Text>
                    <Text style={styles.detailBo}>
                      BO: {selectedAlerta.codigoBo}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          ValkyStatusMeta[selectedAlerta.status]?.bg ??
                          ValkyColors.dangerBg,
                        borderColor:
                          ValkyStatusMeta[selectedAlerta.status]?.border ??
                          ValkyColors.dangerBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            ValkyStatusMeta[selectedAlerta.status]?.color ??
                            ValkyColors.danger,
                        },
                      ]}
                    >
                      {ValkyStatusMeta[selectedAlerta.status]?.shortLabel ??
                        selectedAlerta.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailMeta}>
                  Coordenadas enviadas à polícia: Lat {selectedAlerta.latitude}{' '}
                  • Lng {selectedAlerta.longitude}
                </Text>
                <Text style={styles.detailMeta}>
                  Aberto em:{' '}
                  {new Date(selectedAlerta.criadoEm).toLocaleString('pt-BR')}
                </Text>

                {/* Barra visual de progresso das 4 etapas (visão da família e polícia) */}
                <View style={styles.StepperRow}>
                  {STATUS_LIST.map((st, idx) => {
                    const currentIdx = STATUS_LIST.indexOf(
                      selectedAlerta.status
                    );
                    const reached = idx <= currentIdx;
                    return (
                      <View
                        key={st}
                        style={[
                          styles.stepPill,
                          reached && styles.stepPillReached,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepPillText,
                            reached && styles.stepPillTextReached,
                          ]}
                        >
                          {idx + 1}. {ValkyStatusMeta[st].shortLabel}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.crudButtonsRow}>
                  <Pressable
                    style={styles.primaryActionBtn}
                    onPress={() => abrirModalNovoStatus()}
                  >
                    <Text style={styles.primaryActionBtnText}>
                      + Registrar Andamento Policial
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.editBtn}
                    onPress={() => abrirModalEditarAlerta(selectedAlerta)}
                  >
                    <Text style={styles.editBtnText}>✎ Editar Alerta (PUT)</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => excluirAlerta(selectedAlerta)}
                  >
                    <Text style={styles.deleteBtnText}>
                      ✕ Excluir Alerta (DELETE)
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.divider} />

                <Text style={styles.timelineTitle}>
                  Histórico de Atualizações de Status ({historico.length})
                </Text>

                {loadingHistorico ? (
                  <LoadingView label="Carregando linha do tempo..." />
                ) : historico.length === 0 ? (
                  <Text style={styles.emptyTimelineText}>
                    Nenhuma atualização policial registrada ainda para este
                    alerta. Toque em &quot;+ Registrar Andamento Policial&quot;
                    para simular o despacho da viatura.
                  </Text>
                ) : (
                  historico.map((item) => {
                    const stMeta =
                      ValkyStatusMeta[item.status] ?? ValkyStatusMeta.ABERTO;
                    return (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineItemTop}>
                          <Text
                            style={[
                              styles.timelineStatus,
                              { color: stMeta.color },
                            ]}
                          >
                            ● {stMeta.label}
                          </Text>
                          <Text style={styles.timelineDate}>
                            {new Date(item.criadoEm).toLocaleTimeString('pt-BR')}
                          </Text>
                        </View>

                        <Text style={styles.timelineResp}>
                          Responsável: {item.responsavel}
                        </Text>
                        {item.observacao ? (
                          <Text style={styles.timelineObs}>
                            {item.observacao}
                          </Text>
                        ) : null}

                        <View style={styles.timelineItemActions}>
                          <Pressable
                            onPress={() => abrirModalEditarStatus(item)}
                          >
                            <Text style={styles.timelineEditLink}>
                              ✎ Editar (PUT)
                            </Text>
                          </Pressable>
                          <Pressable onPress={() => excluirStatus(item)}>
                            <Text style={styles.timelineDeleteLink}>
                              ✕ Excluir (DELETE)
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal 1: Criar / Editar Alerta (/api/alertas) */}
      <Modal
        visible={alertaModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAlertaModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAlerta
                  ? `Editar Alerta #${editingAlerta.id}`
                  : 'Acionar Novo Alerta de Emergência'}
              </Text>
              <Pressable onPress={() => setAlertaModalOpen(false)}>
                <Text style={styles.modalClose}>Fechar ✕</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>
              Número do Boletim de Ocorrência (BO) *
            </Text>
            <TextInput
              style={styles.input}
              value={codigoBoInput}
              onChangeText={setCodigoBoInput}
              placeholder="BO-2026-000123"
            />

            <View style={styles.coordsRow}>
              <View style={styles.coordCol}>
                <Text style={styles.label}>Latitude (-90 a 90) *</Text>
                <TextInput
                  style={styles.input}
                  value={latInput}
                  onChangeText={setLatInput}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordCol}>
                <Text style={styles.label}>Longitude (-180 a 180) *</Text>
                <TextInput
                  style={styles.input}
                  value={lngInput}
                  onChangeText={setLngInput}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {editingAlerta && (
              <>
                <Text style={styles.label}>Status do Alerta</Text>
                <View style={styles.statusOptionsGrid}>
                  {STATUS_LIST.map((st) => {
                    const active = statusAlertaInput === st;
                    return (
                      <Pressable
                        key={st}
                        onPress={() => setStatusAlertaInput(st)}
                        style={[
                          styles.statusOptBtn,
                          active && styles.statusOptBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusOptText,
                            active && styles.statusOptTextActive,
                          ]}
                        >
                          {ValkyStatusMeta[st].shortLabel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Pressable
              style={styles.saveModalBtn}
              onPress={handleSalvarAlerta}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={ValkyColors.white} />
              ) : (
                <Text style={styles.saveModalBtnText}>
                  {editingAlerta
                    ? 'Salvar Alterações no Alerta (PUT)'
                    : 'Confirmar Envio de Alerta (POST)'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Criar / Editar Atualização de Status (/api/atualizacoes-status) */}
      <Modal
        visible={statusModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingStatusItem
                  ? `Editar Andamento #${editingStatusItem.id}`
                  : `Registrar Andamento (Alerta #${selectedAlerta?.id})`}
              </Text>
              <Pressable onPress={() => setStatusModalOpen(false)}>
                <Text style={styles.modalClose}>Fechar ✕</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Novo Status da Ocorrência *</Text>
            <View style={styles.statusOptionsGrid}>
              {STATUS_LIST.map((st) => {
                const active = novoStatus === st;
                return (
                  <Pressable
                    key={st}
                    onPress={() => {
                      setNovoStatus(st);
                      if (!editingStatusItem) {
                        setObservacaoInput(ValkyStatusMeta[st].description);
                      }
                    }}
                    style={[
                      styles.statusOptBtn,
                      active && styles.statusOptBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptText,
                        active && styles.statusOptTextActive,
                      ]}
                    >
                      {ValkyStatusMeta[st].shortLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Responsável pelo Registro *</Text>
            <TextInput
              style={styles.input}
              value={responsavelInput}
              onChangeText={setResponsavelInput}
              placeholder="Ex.: Central 190 / Viatura M-204"
            />

            <Text style={styles.label}>Observação do Atendimento</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={observacaoInput}
              onChangeText={setObservacaoInput}
              placeholder="Descreva o andamento para a rede de confiança..."
              multiline
            />

            <Pressable
              style={styles.saveModalBtn}
              onPress={handleSalvarStatus}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={ValkyColors.white} />
              ) : (
                <Text style={styles.saveModalBtnText}>
                  {editingStatusItem
                    ? 'Atualizar Histórico (PUT)'
                    : 'Registrar Andamento (POST)'}
                </Text>
              )}
            </Pressable>
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
    marginBottom: 8,
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  triggerBtn: {
    flex: 1,
    backgroundColor: ValkyColors.danger,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  triggerBtnText: {
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
    padding: 22,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    color: ValkyColors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    color: ValkyColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  sectionTitle: {
    color: ValkyColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertListScroll: {
    gap: 10,
    paddingBottom: 14,
  },
  alertMiniCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    width: 230,
  },
  alertMiniCardSelected: {
    borderColor: ValkyColors.primary,
    borderWidth: 2,
    backgroundColor: ValkyColors.surfaceMuted,
  },
  miniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniId: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  miniBo: {
    color: ValkyColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  miniCoords: {
    color: ValkyColors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: ValkyColors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailEyebrow: {
    color: ValkyColors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.3,
  },
  detailBo: {
    color: ValkyColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailMeta: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  StepperRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 14,
  },
  stepPill: {
    backgroundColor: ValkyColors.background,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stepPillReached: {
    backgroundColor: ValkyColors.primary,
    borderColor: ValkyColors.primary,
  },
  stepPillText: {
    color: ValkyColors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepPillTextReached: {
    color: ValkyColors.white,
  },
  crudButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryActionBtn: {
    backgroundColor: ValkyColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  primaryActionBtnText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  editBtn: {
    flex: 1,
    backgroundColor: ValkyColors.surfaceMuted,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnText: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: ValkyColors.dangerBg,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: ValkyColors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: ValkyColors.border,
    marginVertical: 16,
  },
  timelineTitle: {
    color: ValkyColors.primary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyTimelineText: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  timelineItem: {
    backgroundColor: ValkyColors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    marginBottom: 10,
  },
  timelineItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStatus: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  timelineDate: {
    color: ValkyColors.textMuted,
    fontSize: 11,
  },
  timelineResp: {
    color: ValkyColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  timelineObs: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  timelineItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 8,
  },
  timelineEditLink: {
    color: ValkyColors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  timelineDeleteLink: {
    color: ValkyColors.danger,
    fontSize: 11,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: ValkyColors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  modalClose: {
    color: ValkyColors.secondary,
    fontWeight: 'bold',
    fontSize: 14,
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
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordCol: {
    flex: 1,
  },
  statusOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  statusOptBtn: {
    backgroundColor: ValkyColors.white,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusOptBtnActive: {
    backgroundColor: ValkyColors.primary,
    borderColor: ValkyColors.primary,
  },
  statusOptText: {
    color: ValkyColors.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusOptTextActive: {
    color: ValkyColors.white,
  },
  saveModalBtn: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveModalBtnText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
