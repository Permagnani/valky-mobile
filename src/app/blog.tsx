
import { StyleSheet, Text, View } from 'react-native';

export default function BlogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informação e Acolhimento</Text>
      <Text style={styles.description}>
        Aqui você encontrará conteúdos, orientações
        e publicações do Valky.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3F2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#684A53',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#806C71',
    textAlign: 'center',
  },
});
