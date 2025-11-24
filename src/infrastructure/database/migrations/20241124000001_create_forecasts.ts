import { Knex } from 'knex';

/**
 * Migration: Create forecasts table.
 * 
 * Table stores weather forecast data with unique constraint
 * on (city, state, date) to prevent duplicate entries.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('forecasts', (table) => {
    table.increments('id').primary();

    table.string('city', 100).notNullable();
    table.string('state', 100).notNullable();

    table.date('forecast_date').notNullable();

    table.decimal('temperature', 5, 2).notNullable();
    table.decimal('feels_like', 5, 2).nullable();
    table.string('conditions', 100).notNullable();
    table.text('description').nullable();

    table.decimal('precipitation_chance', 5, 2).nullable();
    table.integer('humidity').nullable();
    table.decimal('wind_speed', 5, 2).nullable();
    table.string('icon_code', 10).nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['city', 'state', 'forecast_date'], {
      indexName: 'forecasts_city_state_forecast_date_unique',
    });
  });
}

/**
 * Rollback: Drop forecasts table.
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('forecasts');
}