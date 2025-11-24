import { Express } from 'express';
import { createApp } from '../../src/server';

/**
 * Creates Express app instance for integration testing.
 * 
 * @author msoler18
 * @description Helper function to create Express app with all dependencies
 * for Supertest integration tests. Uses real dependencies by default.
 * 
 * @returns Express app instance ready for testing
 */
export function createTestApp(): Express {
  return createApp();
}