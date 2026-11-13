
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

const categorias = [
  'Todos',
  'Violência física',
  'Violência psicológica',
  'Violência sexual',
  'Outros registros',
];

const ocorrencias = [
  {
    id: '1',
    titulo: 'Registro demonstrativo 01',
    categoria: 'Violência física',
    descricao: 'Exemplo fictício de registro para demonstrar a apresentação de informações no mapa.',
    data: '10/11/2026',
    orientacao: 'Em uma situação de risco imediato, procure um local seguro e acione os serviços de emergência.',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    id: '2',
    titulo: 'Registro demonstrativo 02',
    categoria: 'Violência psicológica',
    descricao: 'Exemplo fictício de conteúdo informativo sobre violência psicológica.',
    data: '08/11/2026',
    orientacao: 'Busque orientação em serviços especializados de atendimento à mulher.',
    latitude: -23.558,
    longitude: -46.645,
  },
  {
    id: '3',
    titulo: 'Registro demonstrativo 03',
    categoria: 'Violência sexual',
    descricao: 'Exemplo fictício de registro utilizado para demonstrar os detalhes de uma categoria.',
    data: '05/11/2026',
    orientacao: 'Procure atendimento especializado e apoio de um serviço de saúde ou proteção.',
    latitude: -23.543,
    longitude: -46.625,
  },
];

export default function MapScreen() {
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState('Todos');
  const [registroSelecionado, setRegistroSelecionado] =
    useState<string | null>(null);

const registroAtual = ocorrencias.find(
  (item) => item.id === registroSelecionado
);

  const ocorrenciasFiltradas =
    categoriaSelecionada === 'Todos'
      ? ocorrencias
      : ocorrencias.filter(
          (item) => item.categoria === categoriaSelecionada
        );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>VALKY • INFORMAÇÃO</Text>
        <Text style={styles.title}>Mapa de incidências</Text>
        <Text style={styles.subtitle}>
          Visualização de registros demonstrativos.
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
              style={[
                styles.filterButton,
                ativa && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  ativa && styles.filterTextActive,
                ]}
              >
                {categoria}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <MapView
        style={styles.map}
        userInterfaceStyle="light"
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        }}
      >
        {ocorrenciasFiltradas.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor="#A87580"
            onPress={() => setRegistroSelecionado(item.id)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  {item.titulo}
                </Text>
                <Text style={styles.calloutText}>
                  {item.categoria}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {registroAtual && (
  <View style={styles.detailCard}>
    <View style={styles.detailHeader}>
      <Text style={styles.detailTitle}>
        {registroAtual.titulo}
      </Text>

      <Pressable
        onPress={() => setRegistroSelecionado(null)}
      >
        <Text style={styles.closeButton}>Fechar ✕</Text>
      </Pressable>
    </View>

    <Text style={styles.detailCategory}>
      {registroAtual.categoria}
    </Text>

    <Text style={styles.detailLabel}>Descrição</Text>
    <Text style={styles.detailText}>
      {registroAtual.descricao}
    </Text>

    <Text style={styles.detailLabel}>Data demonstrativa</Text>
    <Text style={styles.detailText}>
      {registroAtual.data}
    </Text>

    <Text style={styles.detailLabel}>
      Orientação informativa
    </Text>
    <Text style={styles.detailText}>
      {registroAtual.orientacao}
    </Text>

    <Text style={styles.disclaimer}>
      Conteúdo inteiramente fictício para demonstração.
    </Text>
  </View>
)}

      <View style={styles.legend}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>
          {ocorrenciasFiltradas.length} registros demonstrativos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
  height: 58,
  flexGrow: 0,
},
  container: {
    flex: 1,
    backgroundColor: '#F8F3F2',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  eyebrow: {
    color: '#A87580',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#684A53',
    fontSize: 25,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#806C71',
    fontSize: 13,
    marginTop: 6,
  },
  filters: {
  paddingHorizontal: 18,
  paddingVertical: 6,
  gap: 8,
  alignItems: 'center',
},
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  map: {
    flex: 1,
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
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
  callout: {
    padding: 5,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    color: '#684A53',
    marginBottom: 4,
  },
  calloutText: {
    color: '#806C71',
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
  marginBottom: 12,
},
detailLabel: {
  color: '#684A53',
  fontWeight: 'bold',
  fontSize: 13,
  marginTop: 9,
  marginBottom: 3,
},
detailText: {
  color: '#806C71',
  fontSize: 13,
  lineHeight: 19,
},
disclaimer: {
  color: '#A87580',
  fontSize: 10,
  marginTop: 14,
  fontStyle: 'italic',
},
});
