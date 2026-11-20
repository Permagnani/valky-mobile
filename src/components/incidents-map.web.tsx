import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ValkyColors } from '@/constants/valky-theme';
import type { MapaOcorrenciaItem } from '@/components/incidents-map';

interface IncidentsMapProps {
  items: MapaOcorrenciaItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Componente de Mapa para Web (react-native-web), evitando importar react-native-maps
 * (que utiliza codegenNativeComponent exclusivo do runtime nativo Android/iOS).
 */
export function IncidentsMap({
  items,
  selectedId,
  onSelect,
}: IncidentsMapProps) {
  return (
    <View style={styles.webMapContainer}>
      {/* Painel Visual do Mapa de São Paulo (Web Interactive Canvas) */}
      <View style={styles.mapCanvas}>
        <View style={styles.gridHorizontal1} />
        <View style={styles.gridHorizontal2} />
        <View style={styles.gridVertical1} />
        <View style={styles.gridVertical2} />

        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeText}>
            ⌖ REGIÃO METROPOLITANA DE SÃO PAULO (-23.5505, -46.6333)
          </Text>
        </View>

        {items.map((item, idx) => {
          const isSelected = selectedId === item.id;
          // Posicionamento proporcional das coordenadas dentro do quadro Web
          const topPercent = Math.min(
            82,
            Math.max(18, 50 + (item.latitude - -23.5505) * -1800 + idx * 4)
          );
          const leftPercent = Math.min(
            84,
            Math.max(14, 50 + (item.longitude - -46.6333) * 1800 + idx * 5)
          );

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[
                styles.pinWrapper,
                { top: `${topPercent}%`, left: `${leftPercent}%` },
                isSelected && styles.pinWrapperSelected,
              ]}
            >
              <View
                style={[
                  styles.pinDot,
                  item.isFromApi ? styles.pinDotApi : styles.pinDotDemo,
                  isSelected && styles.pinDotSelected,
                ]}
              >
                <Text style={styles.pinIcon}>⌖</Text>
              </View>
              <View style={styles.pinLabelBox}>
                <Text style={styles.pinLabelText} numberOfLines={1}>
                  {item.titulo}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Lista rápida de marcadores clicáveis no modo Web */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardsStrip}
        contentContainerStyle={styles.cardsStripContent}
      >
        {items.map((item) => {
          const active = selectedId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[
                styles.markerCard,
                active && styles.markerCardActive,
              ]}
            >
              <View style={styles.markerHeader}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: item.isFromApi
                        ? ValkyColors.danger
                        : ValkyColors.secondary,
                    },
                  ]}
                />
                <Text style={styles.markerCategory} numberOfLines={1}>
                  {item.categoria}
                </Text>
              </View>
              <Text style={styles.markerTitle} numberOfLines={1}>
                {item.titulo}
              </Text>
              <Text style={styles.markerCoords}>
                Lat {item.latitude.toFixed(4)} • Lng {item.longitude.toFixed(4)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#EFE7E5',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E9DFDD',
    position: 'relative',
    overflow: 'hidden',
    margin: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8BEC3',
  },
  gridHorizontal1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(104, 74, 83, 0.12)',
  },
  gridHorizontal2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(104, 74, 83, 0.12)',
  },
  gridVertical1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(104, 74, 83, 0.12)',
  },
  gridVertical2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(104, 74, 83, 0.12)',
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAD9DC',
  },
  mapBadgeText: {
    color: '#684A53',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -40 }, { translateY: -20 }],
  },
  pinWrapperSelected: {
    zIndex: 20,
  },
  pinDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinDotDemo: {
    backgroundColor: '#A87580',
  },
  pinDotApi: {
    backgroundColor: ValkyColors.danger,
  },
  pinDotSelected: {
    backgroundColor: '#684A53',
    transform: [{ scale: 1.15 }],
  },
  pinIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinLabelBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#EAD9DC',
    maxWidth: 150,
  },
  pinLabelText: {
    color: '#684A53',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardsStrip: {
    maxHeight: 96,
    flexGrow: 0,
  },
  cardsStripContent: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
  },
  markerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#EAD9DC',
    width: 210,
  },
  markerCardActive: {
    borderColor: '#684A53',
    borderWidth: 2,
    backgroundColor: '#F3E8E9',
  },
  markerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  markerCategory: {
    color: '#A87580',
    fontSize: 10,
    fontWeight: 'bold',
  },
  markerTitle: {
    color: '#684A53',
    fontSize: 13,
    fontWeight: 'bold',
  },
  markerCoords: {
    color: '#806C71',
    fontSize: 11,
    marginTop: 2,
  },
});
