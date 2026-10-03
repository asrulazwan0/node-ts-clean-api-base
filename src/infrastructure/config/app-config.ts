import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url())),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().max(2147483647).default(10000),
  DB_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().max(2147483647).default(5000),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_NAME: z.string().min(1).default('clean_api_db'),
  DB_USERNAME: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().min(1).default('postgres'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .max(2147483647)
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(environment);
  if (!result.success) {
    // Report fields and validation rules, never supplied values (which may be secrets).
    const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Configuration validation error: ${errors.join('; ')}`);
  }
  if (result.data.NODE_ENV === 'production' && !environment.DB_PASSWORD) {
    throw new Error(
      'Configuration validation error: DB_PASSWORD must be explicitly set in production',
    );
  }
  return result.data;
}
