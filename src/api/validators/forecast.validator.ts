import { z } from 'zod';

/**
 * Schema for GET /forecast query parameters
 * Validates city, state, and optional date
 */
export const getForecastQuerySchema = z.object({
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters')
    .trim(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

/**
 * Schema for POST /forecast request body
 * Validates all forecast fields for saving
 */
export const postForecastBodySchema = z.object({
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters')
    .trim(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  temperature: z.number().min(-100).max(100),
  feelsLike: z.number().min(-100).max(100),
  conditions: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  precipitationChance: z.number().min(0).max(100),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0).max(500),
});

export type GetForecastQuery = z.infer<typeof getForecastQuerySchema>;
export type PostForecastBody = z.infer<typeof postForecastBodySchema>;