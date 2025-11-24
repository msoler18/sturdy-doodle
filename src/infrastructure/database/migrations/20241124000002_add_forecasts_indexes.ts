import { Knex } from 'knex';

/**
 * Migration: Add performance indexes to forecasts table.
 * 
 * Indexes optimize common query patterns:
 * - Lookup by location and date (most common)
 * - Lookup by date range
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('forecasts', (table) => {
    // Composite index for location + date queries
    table.index(['city', 'state', 'forecast_date'], 'idx_location_date');

    // Single index for date range queries
    table.index(['forecast_date'], 'idx_forecast_date');
  });
}

/**
 * Rollback: Drop indexes.
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('forecasts', (table) => {
    table.dropIndex(['city', 'state', 'forecast_date'], 'idx_location_date');
    table.dropIndex(['forecast_date'], 'idx_forecast_date');
  });
}