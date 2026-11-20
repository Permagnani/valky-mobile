import { useEffect, useState } from 'react';

import {
  getMigrationStatusReport,
  MigrationStatusReport,
  runPendingMigrations,
} from '@/database/migrations';

/**
 * Custom Hook que executa as migrations de schema local via useEffect
 * na inicialização do aplicativo, sincronizado com a migration EF Core do Oracle.
 */
export function useDatabaseMigrations() {
  const [report, setReport] = useState<MigrationStatusReport>(() =>
    getMigrationStatusReport()
  );
  const [isMigrated, setIsMigrated] = useState<boolean>(false);

  useEffect(() => {
    const result = runPendingMigrations();
    setReport(result);
    setIsMigrated(true);
  }, []);

  return {
    migrationReport: report,
    isMigrated,
  };
}
