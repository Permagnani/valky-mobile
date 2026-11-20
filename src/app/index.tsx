import { Link, router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ValkyColors,
  ValkyPerfilMeta,
  ValkyShadows,
} from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const { isAuthenticated, usuario, pinDisfarceSessao, migrationReport } =
    useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            GLOBAL SOLUTION 2026/2 • CITIZENTECH
          </Text>

          <Text style={styles.title}>
            Proteção desde o BO, com disfarce inteligente.
          </Text>

          <Text style={styles.subtitle}>
            Enquanto apps tradicionais exigem aguardar a medida protetiva, o
            Valky libera o botão de pânico silencioso na calculadora a partir do
            Boletim de Ocorrência e mantém sua rede de confiança informada.
          </Text>
        </View>

        {/* Painel Dinâmico de Sessão e Prontidão (Requisito 2 e 3) */}
        {isAuthenticated && usuario ? (
          <View style={[styles.sessionCard, ValkyShadows.card]}>
            <View style={styles.sessionTop}>
              <View>
                <Text style={styles.sessionWelcome}>
                  Olá, {usuario.nome.split(' ')[0]}
                </Text>
                <Text style={styles.sessionRole}>
                  {ValkyPerfilMeta[usuario.perfil]?.label ?? usuario.perfil} •{' '}
                  {usuario.codigoBo ? `BO: ${usuario.codigoBo}` : 'Sem BO'}
                </Text>
              </View>

              <View
                style={[
                  styles.readyBadge,
                  usuario.prontaParaAlertaSilencioso
                    ? styles.readyBadgeOk
                    : styles.readyBadgeWarn,
                ]}
              >
                <Text
                  style={[
                    styles.readyBadgeText,
                    usuario.prontaParaAlertaSilencioso
                      ? styles.readyBadgeTextOk
                      : styles.readyBadgeTextWarn,
                  ]}
                >
                  {usuario.prontaParaAlertaSilencioso
                    ? '✓ PRONTA'
                    : `${usuario.pendenciasConfiguracao.length} PENDÊNCIA(S)`}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{pinDisfarceSessao} =</Text>
                <Text style={styles.statLabel}>Gatilho na Calculadora</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {usuario.contatosConfianca.length} / 5
                </Text>
                <Text style={styles.statLabel}>Contatos de Confiança</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  v{migrationReport.currentVersion}
                </Text>
                <Text style={styles.statLabel}>Schema Migration</Text>
              </View>
            </View>

            {!usuario.prontaParaAlertaSilencioso &&
              usuario.pendenciasConfiguracao.length > 0 && (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingBoxTitle}>
                    Conclua sua configuração de segurança:
                  </Text>
                  {usuario.pendenciasConfiguracao.map((p, idx) => (
                    <Text key={`${idx}-${p}`} style={styles.pendingBoxItem}>
                      • {p}
                    </Text>
                  ))}
                </View>
              )}

            <View style={styles.sessionActions}>
              <Pressable
                style={styles.calcLaunchBtn}
                onPress={() =>
                  router.push({
                    pathname: '/calculator' as never,
                    params: { inspector: '1' },
                  })
                }
              >
                <Text style={styles.calcLaunchText}>
                  ⊞ Abrir Calculadora Disfarçada
                </Text>
              </Pressable>

              <Link href={'/profile' as never} asChild>
                <Pressable style={styles.profileQuickBtn}>
                  <Text style={styles.profileQuickText}>Meu Perfil</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : (
          <View style={[styles.authBanner, ValkyShadows.card]}>
            <Text style={styles.authBannerEyebrow}>
              INTEGRAÇÃO .NET 10 + ORACLE DATABASE
            </Text>
            <Text style={styles.authBannerTitle}>
              Conecte-se para ativar sua proteção em tempo real
            </Text>
            <Text style={styles.authBannerDesc}>
              Cadastre sua conta com o número do Boletim de Ocorrência (BO),
              configure seu PIN na calculadora e adicione até 5 pessoas à sua
              rede de confiança.
            </Text>

            <View style={styles.authBtnRow}>
              <Link href={'/login' as never} asChild>
                <Pressable style={styles.authPrimaryBtn}>
                  <Text style={styles.authPrimaryText}>Entrar (Login JWT)</Text>
                </Pressable>
              </Link>

              <Link href={'/signup' as never} asChild>
                <Pressable style={styles.authSecondaryBtn}>
                  <Text style={styles.authSecondaryText}>
                    Criar Conta com BO
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Módulos do Ecossistema Valky</Text>

        <Link href={'/calculator' as never} asChild>
          <Pressable style={styles.cardDark}>
            <View style={[styles.iconCircle, styles.iconCircleOrange]}>
              <Text style={styles.iconTextLight}>⊞</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitleLight}>
                Calculadora Disfarçada (Gatilho Silencioso)
              </Text>
              <Text style={styles.cardDescriptionLight}>
                O disfarce é o próprio gatilho: digite seu PIN (
                {pinDisfarceSessao}) e pressione &quot;=&quot; para acionar a
                polícia sem despertar suspeitas.
              </Text>
            </View>

            <Text style={styles.arrowLight}>›</Text>
          </Pressable>
        </Link>

        <Link href={'/alerts' as never} asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>◉</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Central de Alertas e Andamento Policial (CRUD)
              </Text>
              <Text style={styles.cardDescription}>
                Dispare ocorrências e acompanhe em tempo real o status da
                viatura (Recebida, A Caminho, No Local e Encerrada).
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <Link href={'/contacts' as never} asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>♥</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Rede de Pessoas de Confiança (CRUD)
              </Text>
              <Text style={styles.cardDescription}>
                Gerencie até 5 contatos de apoio que recebem avisos por SMS e
                acompanham o atendimento policial no aplicativo.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <Link href={'/map' as never} asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⌖</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Mapa de Incidências e Ocorrências
              </Text>
              <Text style={styles.cardDescription}>
                Visualize registros georreferenciados no mapa interativo,
                incluindo alertas sincronizados com a Valky.Api.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <Link href={'/blog' as never} asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>▤</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Informação e Acolhimento</Text>
              <Text style={styles.cardDescription}>
                Acesse conteúdos sobre a Lei Maria da Penha, direitos, sinais de
                alerta e construção de redes de apoio.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <Link href={'/about' as never} asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>ⓘ</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Sobre o App, Commit Hash, Migrations e HealthCheck
              </Text>
              <Text style={styles.cardDescription}>
                Consulte o hash do commit de referência, migrations aplicadas,
                integrantes do grupo, ODS da ONU e o status da API .NET.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Valky CitizenTech — tecnologia com a cidadã no centro da proteção.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ValkyColors.background,
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 42,
  },
  hero: {
    marginBottom: 22,
  },
  eyebrow: {
    color: ValkyColors.secondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 37,
    marginBottom: 12,
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  sessionCard: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    marginBottom: 24,
  },
  sessionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sessionWelcome: {
    color: ValkyColors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sessionRole: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  readyBadgeOk: {
    backgroundColor: ValkyColors.successBg,
    borderColor: ValkyColors.successBorder,
  },
  readyBadgeWarn: {
    backgroundColor: ValkyColors.warningBg,
    borderColor: ValkyColors.warningBorder,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  readyBadgeTextOk: {
    color: ValkyColors.success,
  },
  readyBadgeTextWarn: {
    color: ValkyColors.warning,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: ValkyColors.background,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    alignItems: 'center',
  },
  statValue: {
    color: ValkyColors.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  statLabel: {
    color: ValkyColors.textMuted,
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  pendingBox: {
    backgroundColor: ValkyColors.warningBg,
    borderColor: ValkyColors.warningBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginBottom: 14,
  },
  pendingBoxTitle: {
    color: ValkyColors.warning,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  pendingBoxItem: {
    color: ValkyColors.warning,
    fontSize: 11,
    lineHeight: 16,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  calcLaunchBtn: {
    flex: 1,
    backgroundColor: '#252528',
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calcLaunchText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  profileQuickBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    borderRadius: 13,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  profileQuickText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  authBanner: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },
  authBannerEyebrow: {
    color: ValkyColors.secondarySoft,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  authBannerTitle: {
    color: ValkyColors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authBannerDesc: {
    color: '#F3E7E9',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  authBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  authPrimaryBtn: {
    flex: 1,
    backgroundColor: ValkyColors.white,
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authPrimaryText: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  authSecondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: ValkyColors.secondarySoft,
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authSecondaryText: {
    color: ValkyColors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionTitle: {
    color: ValkyColors.primary,
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  card: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ValkyColors.border,
  },
  cardDark: {
    backgroundColor: '#232326',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ValkyColors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleOrange: {
    backgroundColor: '#FF9F0A',
  },
  iconText: {
    color: ValkyColors.accent,
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconTextLight: {
    color: ValkyColors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  cardTitle: {
    color: ValkyColors.primary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardTitleLight: {
    color: ValkyColors.white,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  cardDescriptionLight: {
    color: '#D1D1D6',
    fontSize: 12,
    lineHeight: 18,
  },
  arrow: {
    color: ValkyColors.secondary,
    fontSize: 26,
  },
  arrowLight: {
    color: '#FF9F0A',
    fontSize: 26,
  },
  footer: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    color: ValkyColors.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
