/**
 * Forecast domain entity.
 * 
 * @author msoler18
 * @description Represents weather forecast data for a specific location and date.
 * Immutable by design - all properties are readonly to prevent accidental mutations
 * and ensure data integrity across the application. Uses camelCase naming convention
 * (domain layer standard), while database columns use snake_case. Mapping between
 * naming conventions happens in the repository layer.
 */
export interface Forecast {
  readonly id?: number;
  readonly city: string;
  readonly state: string;
  readonly forecastDate: Date;
  readonly temperature: number;
  readonly feelsLike?: number;
  readonly conditions: string;
  readonly description?: string;
  readonly precipitationChance?: number;
  readonly humidity?: number;
  readonly windSpeed?: number;
  readonly iconCode?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}