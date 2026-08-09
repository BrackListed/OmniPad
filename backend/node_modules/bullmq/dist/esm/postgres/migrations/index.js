import { loadMigrationSql } from '../sql-loader';
/**
 * The ordered list of migrations bundled with this version of BullMQ. Append a
 * new entry (never edit or reorder existing ones) whenever the schema changes.
 */
export const MIGRATIONS = [
    {
        version: 1,
        name: '0001_schema',
        load: () => loadMigrationSql('0001_schema.sql'),
    },
    {
        version: 2,
        name: '0002_functions',
        load: () => loadMigrationSql('0002_functions.sql'),
    },
];
/**
 * The highest schema version this BullMQ build knows how to produce. Compared
 * against the version recorded in the database to decide whether to migrate
 * (database older), no-op (equal), or refuse to run (database newer).
 */
export const LATEST_SCHEMA_VERSION = MIGRATIONS.length > 0 ? MIGRATIONS[MIGRATIONS.length - 1].version : 0;
