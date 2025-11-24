import { Forecast } from '../../../domain/entities/Forecast.entity';

/**
 * Type definition for OpenWeatherMap API response item
 */
interface OpenWeatherMapForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  pop: number;
}

/**
 * Type definition for OpenWeatherMap API response
 */
interface OpenWeatherMapResponse {
  list: OpenWeatherMapForecastItem[];
}

/**
 * Adapts OpenWeatherMap API responses to domain Forecast entities.
 * 
 * @author msoler18
 * @description Transforms raw OpenWeatherMap API data into domain Forecast entities.
 * Handles grouping of 3-hour forecasts into daily forecasts by selecting the forecast
 * closest to noon (12:00) for each day. Converts units and field names to match domain
 * entity structure. Temperature is already in Celsius when API is called with units=metric.
 */
export class WeatherResponseAdapter {
  /**
   * Converts OpenWeatherMap forecast response to domain Forecast entities.
   * 
   * @param apiResponse - Raw response from OpenWeatherMap API
   * @param city - City name
   * @param state - State name
   * @param days - Number of days to return (default: 3)
   * @returns Array of Forecast entities
   * @throws Error if apiResponse is invalid or missing required fields
   */
  static toDomain(
    apiResponse: OpenWeatherMapResponse,
    city: string,
    state: string,
    days: number = 3
  ): Forecast[] {
    if (!apiResponse.list || !Array.isArray(apiResponse.list) || apiResponse.list.length === 0) {
      throw new Error('Invalid API response: missing or empty forecast list');
    }

    const forecastsByDate = new Map<string, OpenWeatherMapForecastItem[]>();

    for (const item of apiResponse.list) {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!forecastsByDate.has(dateKey)) {
        forecastsByDate.set(dateKey, []);
      }
      forecastsByDate.get(dateKey)!.push(item);
    }

    const forecasts: Forecast[] = [];
    const dateKeys = Array.from(forecastsByDate.keys()).sort();

    for (let i = 0; i < Math.min(days, dateKeys.length); i++) {
      const dateKey = dateKeys[i];
      const dayForecasts = forecastsByDate.get(dateKey)!;

      const noonForecast = this.selectNoonForecast(dayForecasts);

      forecasts.push({
        city: city.toLowerCase(),
        state: state.toLowerCase(),
        forecastDate: new Date(dateKey),
        temperature: Math.round(noonForecast.main.temp * 10) / 10,
        feelsLike: Math.round(noonForecast.main.feels_like * 10) / 10,
        conditions: noonForecast.weather[0].main,
        description: noonForecast.weather[0].description,
        precipitationChance: Math.round(noonForecast.pop * 100),
        humidity: noonForecast.main.humidity,
        windSpeed: Math.round(noonForecast.wind.speed * 10) / 10,
        iconCode: noonForecast.weather[0].icon,
      });
    }

    return forecasts;
  }

  /**
   * Selects the forecast closest to noon (12:00) from a day's forecasts.
   * 
   * @param dayForecasts - Array of forecasts for a single day
   * @returns Forecast item closest to noon
   */
  private static selectNoonForecast(
    dayForecasts: OpenWeatherMapForecastItem[]
  ): OpenWeatherMapForecastItem {
    const noonHour = 12;

    return dayForecasts.reduce((closest, current) => {
      const currentDate = new Date(current.dt * 1000);
      const closestDate = new Date(closest.dt * 1000);

      const currentDiff = Math.abs(currentDate.getHours() - noonHour);
      const closestDiff = Math.abs(closestDate.getHours() - noonHour);

      return currentDiff < closestDiff ? current : closest;
    });
  }
}