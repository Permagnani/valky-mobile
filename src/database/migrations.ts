/**
 * Gerenciador de Migrations de Estado e Armazenamento Local do App Mobile Valky,
 * sincronizado com a migration EF Core do backend .NET 10 + Oracle Database
 * (20261117000000_InitialCreateValkyOracle -> TB_VALKY_USUARIOS, TB_VALKY_CONTATOS_CONFIANCA,
 * TB_VALKY_ALERTAS e TB_VALKY_ATUALIZACOES_STATUS).
 */

export interface MobileMigrationStep {
  version: number;
  id: string;
  description: string;
  oracleTableTarget: string;
  up: (state: Record<string, unknown>) => Record<string, unknown>;
  down: (state: Record<string, unknown>) => Record<string, unknown>;
}

export interface MigrationStatusReport {
  currentVersion: number;
  appliedMigrations: string[];
  backendEfCoreMigration: string;
  lastExecutedAt: string;
}

export const BACKEND_EFCORE_MIGRATION_ID =
  '20261117000000_InitialCreateValkyOracle';

export const VALKY_MOBILE_MIGRATIONS: MobileMigrationStep[] = [
  {
    version: 1,
    id: '20261117_01_CreateUserSessionSchema',
    description:
      'Inicializa estrutura local de sessão JWT e perfil espelhando TB_VALKY_USUARIOS',
    oracleTableTarget: 'TB_VALKY_USUARIOS',
    up: (state) => ({
      ...state,
      schemaVersion: 1,
      sessionConfig: {
        jwtEnabled: true,
        defaultPinDisfarce: '1901',
        requireCodigoBoForUsuaria: true,
      },
    }),
    down: (state) => {
      const next = { ...state };
      delete next.sessionConfig;
      return { ...next, schemaVersion: 0 };
    },
  },
  {
    version: 2,
    id: '20261117_02_CreateTrustedContactsSchema',
    description:
      'Adiciona suporte e cache para Rede de Contatos de Confiança (máx. 5 contatos)',
    oracleTableTarget: 'TB_VALKY_CONTATOS_CONFIANCA',
    up: (state) => ({
      ...state,
      schemaVersion: 2,
      contactsPolicy: {
        maxContacts: 5,
        channels: ['SMS', 'APP'],
      },
    }),
    down: (state) => {
      const next = { ...state };
      delete next.contactsPolicy;
      return { ...next, schemaVersion: 1 };
    },
  },
  {
    version: 3,
    id: '20261117_03_CreateSilentAlertsAndTimelineSchema',
    description:
      'Configura fila de alertas silenciosos da calculadora e linha do tempo policial 190',
    oracleTableTarget: 'TB_VALKY_ALERTAS / TB_VALKY_ATUALIZACOES_STATUS',
    up: (state) => ({
      ...state,
      schemaVersion: 3,
      alertsSchema: {
        allowedStatuses: [
          'ABERTO',
          'VIATURA_A_CAMINHO',
          'NO_LOCAL',
          'ENCERRADO',
        ],
        backendMigrationRef: BACKEND_EFCORE_MIGRATION_ID,
      },
    }),
    down: (state) => {
      const next = { ...state };
      delete next.alertsSchema;
      return { ...next, schemaVersion: 2 };
    },
  },
];

let migrationStateStore: Record<string, unknown> = {
  schemaVersion: 0,
};

let lastMigrationReport: MigrationStatusReport = {
  currentVersion: 0,
  appliedMigrations: [],
  backendEfCoreMigration: BACKEND_EFCORE_MIGRATION_ID,
  lastExecutedAt: new Date().toISOString(),
};

/**
 * Executa de forma idempotente todas as migrations pendentes no startup do aplicativo.
 */
export function runPendingMigrations(): MigrationStatusReport {
  const currentVersion = Number(migrationStateStore.schemaVersion ?? 0);
  const applied: string[] = [];

  const sorted = [...VALKY_MOBILE_MIGRATIONS].sort(
    (a, b) => a.version - b.version
  );

  for (const step of sorted) {
    if (step.version > currentVersion) {
      migrationStateStore = step.up(migrationStateStore);
    }
    applied.push(`${step.id} (${step.oracleTableTarget})`);
  }

  lastMigrationReport = {
    currentVersion: Number(migrationStateStore.schemaVersion ?? sorted.length),
    appliedMigrations: applied,
    backendEfCoreMigration: BACKEND_EFCORE_MIGRATION_ID,
    lastExecutedAt: new Date().toISOString(),
  };

  return lastMigrationReport;
}

export function getMigrationStatusReport(): MigrationStatusReport {
  return lastMigrationReport;
}
