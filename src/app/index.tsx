
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { login } from '@/services/api';
import { getToken, removeToken } from '@/services/auth-storage';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [usuario, setUsuario] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    async function verificarSessao() {
      try {
        const token = await getToken();
        if (token) {
          setAutenticado(true);
          setUsuario('Sessão ativa');
        }
      } catch {
        setAutenticado(false);
      }
    }

    verificarSessao();
  }, []);

  async function entrar() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    try {
      setCarregando(true);

      const resposta = await login(email.trim(), senha);

      setUsuario(resposta.nome);
      setAutenticado(true);
      setSenha('');

      Alert.alert('Bem-vinda!', 'Login realizado com sucesso.');
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        error instanceof Error ? error.message : 'Verifique seus dados.',
      );
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    try {
      await removeToken();
      setAutenticado(false);
      setUsuario('');
      setEmail('');
      setSenha('');
      Alert.alert('Sessão encerrada', 'Você saiu da sua conta.');
    } catch {
      Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>valky.</Text>
          <Text style={styles.headerLabel}>
            INFORMAÇÃO E ACOLHIMENTO
          </Text>
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

        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>
            {autenticado ? 'Você está conectada!' : 'Acesse sua conta'}
          </Text>

          {autenticado ? (
            <>
              <Text style={styles.loginDescription}>
                Olá, {usuario}. Sua autenticação foi realizada.
              </Text>

              <Pressable style={styles.logoutButton} onPress={sair}>
                <Text style={styles.logoutButtonText}>Sair da conta</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.loginDescription}>
                Entre para acessar sua conta Valky.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#A58C92"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#A58C92"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable
                style={[
                  styles.loginButton,
                  carregando && styles.disabledButton,
                ]}
                onPress={entrar}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Explore o Valky</Text>

        <Link href="/map" asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⌖</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mapa de incidências</Text>
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
    marginBottom: 35,
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
    marginBottom: 28,
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
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#EAD9DC',
  },
  loginTitle: {
    color: '#684A53',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loginDescription: {
    color: '#806C71',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FAF6F5',
    borderWidth: 1,
    borderColor: '#EAD9DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#684A53',
    fontSize: 15,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#684A53',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#A87580',
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#684A53',
    fontWeight: 'bold',
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
