import knex, { Knex } from 'knex';
import databaseConfig from '../../src/config/database.config';

/**
 * Creates a test database connection.
 * 
 * @author msoler18
 * @description Creates a Knex connection for testing. Uses test database
 * configuration. Should be used in beforeEach/afterEach hooks to ensure
 * clean state between tests.
 * 
 * @returns Knex instance for test database
 */
export function createTestDb(): Knex {
  const testConfig = databaseConfig.test || databaseConfig.development;
  return knex(testConfig);
}

/**
 * Cleans all tables in the test database.
 * 
 * @author msoler18
 * @description Truncates all tables to ensure clean state. Should be called
 * in beforeEach or afterEach hooks.
 * 
 * @param db - Knex database instance
 */
export async function cleanDatabase(db: Knex): Promise<void> {
  await db('forecasts').truncate();
}