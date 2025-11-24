/* eslint-disable no-console */
import dotenv from 'dotenv';

import { logger } from '../../src/config/logger.config';
import { OpenWeatherMapClient } from '../../src/infrastructure/weather/clients/OpenWeatherMapClient';

dotenv.config({ path: '.env.development' });

/**
 * Manual test script for OpenWeatherMap API integration.
 * 
 * @author msoler18
 * @description Tests the complete weather API integration including client
 * initialization, API requests, response parsing, and error handling.
 */
async function testWeatherClient(): Promise<void> {
  console.log('Testing OpenWeatherMap API Integration\n');
  console.log('='.repeat(60));

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = process.env.OPENWEATHER_BASE_URL;
  const timeout = parseInt(process.env.WEATHER_API_TIMEOUT_MS || '5000', 10);

  if (!apiKey || !baseUrl) {
    console.error('Error: Missing required environment variables');
    console.error('   Please ensure OPENWEATHER_API_KEY and OPENWEATHER_BASE_URL are set');
    process.exit(1);
  }

  console.log('Environment variables loaded');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Timeout: ${timeout}ms`);
  console.log(`   API Key: ${apiKey.substring(0, 8)}...`);
  console.log('='.repeat(60));
  console.log('');

  const client = new OpenWeatherMapClient(apiKey, baseUrl, timeout);

  const testCases = [
    { city: 'fresno', state: 'california', days: 3 },
    { city: 'san francisco', state: 'california', days: 3 },
    { city: 'new york', state: 'new york', days: 3 },
  ];

  for (const testCase of testCases) {
    await testForecastRequest(client, testCase.city, testCase.state, testCase.days);
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests completed successfully!');
  console.log('='.repeat(60));
}

/**
 * Tests a single forecast request and displays results.
 */
async function testForecastRequest(
  client: OpenWeatherMapClient,
  city: string,
  state: string,
  days: number
): Promise<void> {
  console.log(`\n Testing: ${city}, ${state} (${days} days)`);
  console.log('-'.repeat(60));

  try {
    const startTime = Date.now();
    const forecasts = await client.getForecast(city, state, days);
    const duration = Date.now() - startTime;

    console.log(`Success! (${duration}ms)`);
    console.log(`   Forecasts received: ${forecasts.length}`);
    console.log('');

    forecasts.forEach((forecast, index) => {
      console.log(`   Day ${index + 1}: ${forecast.forecastDate.toISOString().split('T')[0]}`);
      console.log(`      Temperature: ${forecast.temperature}°C`);
      console.log(`      Feels Like: ${forecast.feelsLike}°C`);
      console.log(`      Conditions: ${forecast.conditions}`);
      console.log(`      Description: ${forecast.description}`);
      console.log(`      Precipitation: ${forecast.precipitationChance}%`);
      console.log(`      Humidity: ${forecast.humidity}%`);
      console.log(`      Wind Speed: ${forecast.windSpeed} m/s`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      logger.error('Test failed', { error, city, state });
    }
  }
}

testWeatherClient().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});