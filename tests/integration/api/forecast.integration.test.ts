import request from 'supertest';
import { Express } from 'express';

import { createTestApp } from '../../setup/test-server';
import { createTestDb, cleanDatabase } from '../../setup/test-db';
import { Knex } from 'knex';

describe('Forecast API Integration Tests', () => {
  let app: Express;
  let db: Knex;

  beforeAll(async () => {
    db = createTestDb();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  beforeEach(async () => {
    await cleanDatabase(db);
    app = createTestApp();
  });

  describe('GET /api/v1/forecast', () => {
    it('should return 3-day forecast for valid location', async () => {
      const response = await request(app)
        .get('/api/v1/forecast')
        .query({ city: 'fresno', state: 'california' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.length).toBeLessThanOrEqual(3);

      const forecast = response.body.data[0];
      expect(forecast).toHaveProperty('date');
      expect(forecast).toHaveProperty('temperature');
      expect(forecast).toHaveProperty('feelsLike');
      expect(forecast).toHaveProperty('conditions');
      expect(forecast).toHaveProperty('description');
      expect(forecast).toHaveProperty('precipitationChance');
      expect(forecast).toHaveProperty('humidity');
      expect(forecast).toHaveProperty('windSpeed');
    });

    it('should return forecast for specific date when date parameter provided', async () => {
      const response = await request(app)
        .get('/api/v1/forecast')
        .query({
          city: 'fresno',
          state: 'california',
          date: '2025-11-25',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('date', '2025-11-25');
    });

    it('should return 400 when city parameter is missing', async () => {
      const response = await request(app)
        .get('/api/v1/forecast')
        .query({ state: 'california' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('metadata');
    });

    it('should return 400 when state parameter is missing', async () => {
      const response = await request(app)
        .get('/api/v1/forecast')
        .query({ city: 'fresno' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 400 when date format is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/forecast')
        .query({
          city: 'fresno',
          state: 'california',
          date: 'invalid-date',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should normalize city and state to lowercase', async () => {
      const response = await request(app)
        .get('/api/v1/forecast')
        .query({ city: 'FRESNO', state: 'CALIFORNIA' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/v1/forecast', () => {
    it('should save forecast successfully with valid data', async () => {
      const forecastData = {
        city: 'fresno',
        state: 'california',
        date: '2025-11-25',
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy with light winds',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
      };

      const response = await request(app)
        .post('/api/v1/forecast')
        .send(forecastData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('date', '2025-11-25');
      expect(response.body.data).toHaveProperty('temperature', 18.5);
      expect(response.body.data).toHaveProperty('city', 'fresno');
      expect(response.body.data).toHaveProperty('state', 'california');
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        city: 'fresno',
        state: 'california',
      };

      const response = await request(app)
        .post('/api/v1/forecast')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('metadata');
    });

    it('should return 400 when date format is invalid', async () => {
      const invalidData = {
        city: 'fresno',
        state: 'california',
        date: 'invalid-date',
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
      };

      const response = await request(app)
        .post('/api/v1/forecast')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should update existing forecast when same city/state/date', async () => {
      const forecastData = {
        city: 'fresno',
        state: 'california',
        date: '2025-11-25',
        temperature: 18.5,
        feelsLike: 17.2,
        conditions: 'Partly Cloudy',
        description: 'Partly cloudy',
        precipitationChance: 10,
        humidity: 45,
        windSpeed: 12.5,
      };

      await request(app)
        .post('/api/v1/forecast')
        .send(forecastData)
        .expect(201);

      const updatedData = { ...forecastData, temperature: 20.0 };
      const response = await request(app)
        .post('/api/v1/forecast')
        .send(updatedData)
        .expect(201);

      expect(response.body.data).toHaveProperty('temperature', 20.0);
    });
  });
});