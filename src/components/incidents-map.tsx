import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

import { ValkyColors } from '@/constants/valky-theme';

export interface MapaOcorrenciaItem {
  id: string;
  apiAlertaId?: number;
  titulo: string;
  categoria: string;
  descricao: string;
  data: string;
  orientacao: string;
  latitude: number;
  longitude: number;
  isFromApi?: boolean;
}

interface IncidentsMapProps {
  items: MapaOcorrenciaItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Componente nativo de mapa (Android / iOS) utilizando react-native-maps.
 */
export function IncidentsMap({
  items,
  onSelect,
}: IncidentsMapProps) {
  return (
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
      {items.map((item) => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: item.latitude,
            longitude: item.longitude,
          }}
          pinColor={item.isFromApi ? ValkyColors.danger : '#A87580'}
          onPress={() => onSelect(item.id)}
        >
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{item.titulo}</Text>
              <Text style={styles.calloutText}>{item.categoria}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
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
});
