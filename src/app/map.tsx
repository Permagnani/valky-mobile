import { Link } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  IncidentsMap,
  MapaOcorrenciaItem,
} from '@/components/incidents-map';
import { ValkyStatusMeta } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { AlertService } from '@/services/alert-service';
import { AlertaResponse } from '@/types/api';

const categorias = [
  'Todos',
  'Alertas API (.NET)',
  'Violência física',
  'Violência psicológica',
  'Violência sexual',
];

const ocorrenciasBase: MapaOcorrenciaItem[] = [
  {
    id: 'demo-1',
    titulo: 'Registro demonstrativo 01',
    categoria: 'Violência física',
    descricao:
      'Exemplo fictício de registro para demonstrar a apresentação de informações no mapa.',
    data: '10/11/2026',
    orientacao:
      'Em uma situação de risco imediato, procure um local seguro e acione os serviços de emergência.',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    id: 'demo-2',
    titulo: 'Registro demonstrativo 02',
    categoria: 'Violência psicológica',
    descricao:
      'Exemplo fictício de conteúdo informativo sobre violência psicológica.',
    data: '08/11/2026',
    orientacao:
      'Busque orientação em serviços especializados de atendimento à mulher.',
    latitude: -23.558,
    longitude: -46.645,
  },
  {
    id: 'demo-3',
    titulo: 'Registro demonstrativo 03',
    categoria: 'Violência sexual',
    descricao:
      'Exemplo fictício de registro utilizado para demonstrar os detalhes de uma categoria.',
    data: '05/11/2026',
    orientacao:
      'Procure atendimento especializado e apoio de um serviço de saúde ou proteção.',
    latitude: -23.543,
    longitude: -46.625,
  },
];

export default function MapScreen() {
  const { isAuthenticated } = useAuth();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos');
  const [registroSelecionado, setRegistroSelecionado] = useState<string | null>(
    null
  );
  const [alertasApi, setAlertasApi] = useState<MapaOcorrenciaItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  const sincronizarAlertasMapa = useCallback(async () => {
    if (!isAuthenticated) {
      setAlertasApi([]);
      return;
    }
    setSyncing(true);
    try {
      const lista: AlertaResponse[] = await AlertService.listarAlertas();
      const convertidos: MapaOcorrenciaItem[] = lista.map((a) => ({
        id: `api-${a.id}`,
        apiAlertaId: a.id,
        titulo: `Alerta Real #${a.id} (${a.codigoBo})`,
        categoria: 'Alertas API (.NET)',
        descricao: `Status atual: ${
          ValkyStatusMeta[a.status]?.label ?? a.status
        }. Coordenadas sincronizadas via Valky.Api.`,
        data: new Date(a.criadoEm).toLocaleString('pt-BR'),
        orientacao:
          ValkyStatusMeta[a.status]?.description ??
          'Ocorrência monitorada pela Central 190 e Rede de Confiança.',
        latitude: Number(a.latitude),
        longitude: Number(a.longitude),
        isFromApi: true,
      }));
      setAlertasApi(convertidos);
    } catch {
      // Mantém pontos demonstrativos caso a API esteja offline
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    sincronizarAlertasMapa();
  }, [sincronizarAlertasMapa]);

  const todasOcorrencias = [...alertasApi, ...ocorrenciasBase];

  const registroAtual = todasOcorrencias.find(
    (item) => item.id === registroSelecionado
  );

  const ocorrenciasFiltradas =
    categoriaSelecionada === 'Todos'
      ? todasOcorrencias
      : todasOcorrencias.filter(
          (item) => item.categoria === categoriaSelecionada
        );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>VALKY • GEOLOCALIZAÇÃO & APOIO</Text>
            <Text style={styles.title}>Mapa de incidências</Text>
          </View>
          {isAuthenticated && (
            <Pressable
              style={styles.syncBtn}
              onPress={sincronizarAlertasMapa}
              disabled={syncing}
            >
              <Text style={styles.syncBtnText}>
                {syncing ? 'Sincronizando...' : `↻ API (${alertasApi.length})`}
              </Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.subtitle}>
          Visualização de registros informativos e alertas em tempo real da
          Valky.Api.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
      >
        {categorias.map((categoria) => {
          const ativa = categoriaSelecionada === categoria;

          return (
            <Pressable
              key={categoria}
              onPress={() => setCategoriaSelecionada(categoria)}
              style={[styles.filterButton, ativa && styles.filterActive]}
            >
              <Text
                style={[styles.filterText, ativa && styles.filterTextActive]}
              >
                {categoria}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <IncidentsMap
        items={ocorrenciasFiltradas}
        selectedId={registroSelecionado}
        onSelect={(id) => setRegistroSelecionado(id)}
      />

      {registroAtual && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{registroAtual.titulo}</Text>

            <Pressable onPress={() => setRegistroSelecionado(null)}>
              <Text style={styles.closeButton}>Fechar ✕</Text>
            </Pressable>
          </View>

          <Text style={styles.detailCategory}>{registroAtual.categoria}</Text>

          <Text style={styles.detailLabel}>Descrição</Text>
          <Text style={styles.detailText}>{registroAtual.descricao}</Text>

          <Text style={styles.detailLabel}>Data / Horário</Text>
          <Text style={styles.detailText}>{registroAtual.data}</Text>

          <Text style={styles.detailLabel}>Orientação e Andamento</Text>
          <Text style={styles.detailText}>{registroAtual.orientacao}</Text>

          {registroAtual.isFromApi && registroAtual.apiAlertaId ? (
            <Link
              href={{
                pathname: '/alerts' as never,
                params: { alertaId: String(registroAtual.apiAlertaId) },
              }}
              asChild
            >
              <Pressable style={styles.openAlertBtn}>
                <Text style={styles.openAlertBtnText}>
                  Abrir Alerta #{registroAtual.apiAlertaId} na Central 190 →
                </Text>
              </Pressable>
            </Link>
          ) : null}

          <Text style={styles.disclaimer}>
            {registroAtual.isFromApi
              ? 'Registro sincronizado diretamente da Valky.Api (.NET 10 + Oracle).'
              : 'Conteúdo demonstrativo para conscientização e prevenção.'}
          </Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>
          {ocorrenciasFiltradas.length} registro(s) no mapa ({alertasApi.length}{' '}
          sincronizado(s) da API)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    height: 54,
    flexGrow: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F3F2',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#A87580',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#684A53',
    fontSize: 24,
    fontWeight: 'bold',
  },
  syncBtn: {
    backgroundColor: '#F3E8E9',
    borderWidth: 1,
    borderColor: '#D8BEC3',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  syncBtnText: {
    color: '#684A53',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#806C71',
    fontSize: 12,
    marginTop: 4,
  },
  filters: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAD9DC',
  },
  filterActive: {
    backgroundColor: '#684A53',
    borderColor: '#684A53',
  },
  filterText: {
    color: '#806C71',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 9,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#A87580',
  },
  legendText: {
    color: '#684A53',
    fontSize: 12,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#EAD9DC',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailTitle: {
    color: '#684A53',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    color: '#A87580',
    fontWeight: '600',
    padding: 5,
  },
  detailCategory: {
    color: '#A87580',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#684A53',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 2,
  },
  detailText: {
    color: '#806C71',
    fontSize: 13,
    lineHeight: 19,
  },
  openAlertBtn: {
    backgroundColor: '#684A53',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  openAlertBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  disclaimer: {
    color: '#A87580',
    fontSize: 10,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
