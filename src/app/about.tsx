import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  APP_INFO,
  GROUP_MEMBERS,
  ONU_ODS,
} from '@/constants/app-info';
import { ValkyColors, ValkyShadows } from '@/constants/valky-theme';
import { useAuth } from '@/contexts/auth-context';
import { useApiHealth } from '@/hooks/use-api-health';

/**
 * Tela "Sobre o App" exigida no Requisito 7 (Publicação do App).
 * - Exibe em destaque o hash do commit de referência do repositório Git.
 * - Exibe o relatório das Migrations locais e da Migration EF Core Oracle.
 * - Verifica em tempo real o status e o HealthCheck (/health) da Valky.Api (.NET 10 + Oracle) via custom hook useApiHealth.
 * - Lista os integrantes do grupo (RM, Nome e Turma) e os ODS da ONU atendidos.
 * Obs.: Esta tela é extra e não é contabilizada nas 6 telas mínimas do Requisito 1.
 */
export default function AboutScreen() {
  const { apiUrl, migrationReport } = useAuth();
  const { rootStatus, health, checking, apiError, verificarBackend } =
    useApiHealth(apiUrl, true);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          REQUISITO 7 • FIREBASE APP DISTRIBUTION & RASTREABILIDADE
        </Text>
        <Text style={styles.title}>Sobre o App — {APP_INFO.name}</Text>
        <Text style={styles.subtitle}>{APP_INFO.tagline}</Text>

        {/* Card de Rastreabilidade de Build & Hash do Commit (Requisito 7) */}
        <View style={[styles.commitCard, ValkyShadows.card]}>
          <Text style={styles.commitLabel}>
            HASH DO COMMIT DE REFERÊNCIA (GIT HEAD)
          </Text>
          <Text style={styles.commitShort}>{APP_INFO.commitHashShort}</Text>
          <Text style={styles.commitFull} selectable>
            {APP_INFO.commitHashFull}
          </Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaBox}>
              <Text style={styles.metaKey}>VERSÃO DO APP</Text>
              <Text style={styles.metaVal}>v{APP_INFO.version}</Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.metaKey}>PLATAFORMA</Text>
              <Text style={styles.metaVal}>{APP_INFO.sdkVersion}</Text>
            </View>
          </View>

          <Text style={styles.distroInfo}>
            Distribuição: Firebase App Distribution • Grupo:{' '}
            {APP_INFO.firebaseDistributionGroup}
          </Text>
        </View>

        {/* Card de Migrations (Mobile + EF Core Oracle) */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>
            Migrations de Schema (v{migrationReport.currentVersion}) & EF Core
            Oracle
          </Text>
          <Text style={styles.apiUrlText}>
            Migration Backend (.NET 10):{' '}
            <Text style={styles.bold}>
              {migrationReport.backendEfCoreMigration}
            </Text>
          </Text>
          {migrationReport.appliedMigrations.map((mig) => (
            <Text key={mig} style={styles.migrationLine}>
              ✓ {mig}
            </Text>
          ))}
        </View>

        {/* Card de Diagnóstico ao vivo da Valky.Api (.NET 10 + Oracle) */}
        <View style={[styles.card, ValkyShadows.card]}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>
              Status do Backend ({APP_INFO.backendTech})
            </Text>
            <Pressable
              style={styles.pingBtn}
              onPress={verificarBackend}
              disabled={checking}
            >
              {checking ? (
                <ActivityIndicator size="small" color={ValkyColors.primary} />
              ) : (
                <Text style={styles.pingBtnText}>↻ Testar /health</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.apiUrlText}>Endpoint configurado: {apiUrl}</Text>

          {health ? (
            <View style={styles.healthSuccessBox}>
              <Text style={styles.healthTitle}>
                ✓ {rootStatus?.aplicacao ?? 'Valky API'} v
                {rootStatus?.versao ?? '1.0.0'} — {health.status} (
                {health.tempoTotalMs} ms)
              </Text>
              {health.verificacoes?.map((item) => (
                <Text key={item.nome} style={styles.healthCheckLine}>
                  • {item.nome}: {item.status} ({Math.round(item.duracaoMs)} ms)
                </Text>
              ))}
            </View>
          ) : apiError ? (
            <View style={styles.healthWarnBox}>
              <Text style={styles.healthWarnText}>⚠ {apiError}</Text>
            </View>
          ) : null}
        </View>

        {/* Integrantes do Grupo (2TDSPV) */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>
            Integrantes do Grupo Valky ({APP_INFO.course})
          </Text>
          {GROUP_MEMBERS.map((m) => (
            <View key={m.rm} style={styles.memberRow}>
              <View style={styles.rmBadge}>
                <Text style={styles.rmText}>RM {m.rm}</Text>
              </View>
              <Text style={styles.memberName}>{m.nome}</Text>
              <Text style={styles.memberClass}>{m.turma}</Text>
            </View>
          ))}
        </View>

        {/* Conexão com os ODS da ONU (Agenda 2030) */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>
            Conexão com os ODS da ONU (Agenda 2030)
          </Text>
          {ONU_ODS.map((ods) => (
            <View key={ods.numero} style={styles.odsItem}>
              <View style={styles.odsCircle}>
                <Text style={styles.odsNumber}>ODS {ods.numero}</Text>
              </View>
              <View style={styles.odsTextCol}>
                <Text style={styles.odsTitle}>{ods.titulo}</Text>
                <Text style={styles.odsDesc}>{ods.descricao}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Camadas Arquiteturais do App Mobile */}
        <View style={[styles.card, ValkyShadows.card]}>
          <Text style={styles.sectionTitle}>
            Arquitetura em Camadas do Aplicativo (Requisito 5)
          </Text>
          <Text style={styles.archItem}>
            • <Text style={styles.bold}>src/app/</Text>: Camada de navegação e
            telas com Expo Router (`Link`, `router`, `useLocalSearchParams`,
            `usePathname`, `Slot`).
          </Text>
          <Text style={styles.archItem}>
            • <Text style={styles.bold}>src/hooks/</Text>: Custom Hooks com
            `useEffect` (`useDatabaseMigrations`, `useApiHealth`, `useContacts`,
            `useAlerts`).
          </Text>
          <Text style={styles.archItem}>
            • <Text style={styles.bold}>src/services/</Text>: Camada de acesso à
            API REST (`fetch`) com injeção automática de JWT Bearer, header
            `X-Client-Id` (Rate Limiting CGNAT) e parser de erros RFC 7807.
          </Text>
          <Text style={styles.archItem}>
            • <Text style={styles.bold}>src/database/</Text>: Gerenciador de
            Migrations de schema local sincronizado com o EF Core Oracle.
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 52,
  },
  eyebrow: {
    color: ValkyColors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.7,
    marginBottom: 6,
  },
  title: {
    color: ValkyColors.primary,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: ValkyColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  commitCard: {
    backgroundColor: ValkyColors.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },
  commitLabel: {
    color: ValkyColors.secondarySoft,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  commitShort: {
    color: ValkyColors.white,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  commitFull: {
    color: '#F3E7E9',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metaBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
  },
  metaKey: {
    color: ValkyColors.secondarySoft,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  metaVal: {
    color: ValkyColors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 3,
  },
  distroInfo: {
    color: ValkyColors.secondarySoft,
    fontSize: 11,
  },
  card: {
    backgroundColor: ValkyColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: ValkyColors.border,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: ValkyColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginBottom: 8,
  },
  pingBtn: {
    backgroundColor: ValkyColors.surfaceMuted,
    borderWidth: 1,
    borderColor: ValkyColors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pingBtnText: {
    color: ValkyColors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  apiUrlText: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  migrationLine: {
    color: ValkyColors.success,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  healthSuccessBox: {
    backgroundColor: ValkyColors.successBg,
    borderColor: ValkyColors.successBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  healthTitle: {
    color: ValkyColors.success,
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  healthCheckLine: {
    color: ValkyColors.success,
    fontSize: 12,
  },
  healthWarnBox: {
    backgroundColor: ValkyColors.warningBg,
    borderColor: ValkyColors.warningBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  healthWarnText: {
    color: ValkyColors.warning,
    fontSize: 12,
    lineHeight: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: ValkyColors.border,
    gap: 10,
  },
  rmBadge: {
    backgroundColor: ValkyColors.surfaceMuted,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rmText: {
    color: ValkyColors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  memberName: {
    flex: 1,
    color: ValkyColors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  memberClass: {
    color: ValkyColors.secondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  odsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 10,
  },
  odsCircle: {
    backgroundColor: ValkyColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 62,
    alignItems: 'center',
  },
  odsNumber: {
    color: ValkyColors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  odsTextCol: {
    flex: 1,
  },
  odsTitle: {
    color: ValkyColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  odsDesc: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  archItem: {
    color: ValkyColors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  bold: {
    color: ValkyColors.primary,
    fontWeight: 'bold',
  },
});
