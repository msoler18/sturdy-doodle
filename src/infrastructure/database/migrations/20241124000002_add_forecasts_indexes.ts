import { Knex } from 'knex';

/**
 * Migration: Add performance indexes to forecasts table.
 * 
 * @author msoler18
 * @description Creates two indexes to optimize the most common query patterns.
 * The composite index (city, state, forecast_date) supports cache lookups by
 * location and date, which is the primary use case (99% of queries). The single
 * date index supports less common date-range queries for analytics. These indexes
 * reduce query time from O(n) table scans to O(log n) index lookups.
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