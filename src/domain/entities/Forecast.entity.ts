/**
 * Forecast domain entity.
 * 
 * Represents weather forecast data for a specific location and date.
 * Immutable by design - all properties are readonly.
 * @author msoler18
 * @description Represents weather forecast data for a specific location and date.
 * Mapping between them happens in repositories.
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