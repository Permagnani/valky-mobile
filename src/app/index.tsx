
import { Link } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>valky.</Text>
          <Text style={styles.headerLabel}>INFORMAÇÃO E ACOLHIMENTO</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>UM ESPAÇO DE APOIO</Text>

          <Text style={styles.title}>
            Informação também é uma forma de proteção.
          </Text>

          <Text style={styles.subtitle}>
            Conhecimento, orientação e acesso à informação
            para fortalecer mulheres.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Explore o Valky
        </Text>

        <Link href="/map" asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⌖</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Mapa de incidências
              </Text>
              <Text style={styles.cardDescription}>
                Consulte informações sobre ocorrências e
                conheça os dados apresentados no mapa.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <Link href="/blog" asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>▤</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Informação e acolhimento
              </Text>
              <Text style={styles.cardDescription}>
                Acesse conteúdos, orientações e publicações
                do Valky.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Valky — informação, cuidado e proteção.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F3F2',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 48,
  },
  logo: {
    color: '#684A53',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -1.5,
  },
  headerLabel: {
    color: '#A87580',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 4,
  },
  hero: {
    marginBottom: 38,
  },
  eyebrow: {
    color: '#A87580',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  title: {
    color: '#684A53',
    fontSize: 34,
    fontWeight: 'bold',
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    color: '#806C71',
    fontSize: 16,
    lineHeight: 25,
  },
  sectionTitle: {
    color: '#684A53',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAD9DC',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#995D6B',
    fontSize: 29,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  cardTitle: {
    color: '#684A53',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescription: {
    color: '#806C71',
    fontSize: 13,
    lineHeight: 19,
  },
  arrow: {
    color: '#A87580',
    fontSize: 30,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#A87580',
    fontSize: 12,
    textAlign: 'center',
  },
});
