import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.string().default('info'),
  
  // Database configuration
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('clean_api_db'),
  DB_USER: z.string().default('user'),
  DB_PASSWORD: z.string().default('password'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100), // Max 100 requests per window
  
  // JWT Secret (if authentication is added later)
  JWT_SECRET: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(): AppConfig {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattenedErrors = error.flatten();
      throw new Error(
        `Configuration validation error: ${JSON.stringify(flattenedErrors.fieldErrors, null, 2)}`
      );
    }
    throw error;
  }
}