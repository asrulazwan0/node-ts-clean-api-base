import { describe, expect, it } from 'vitest';
import { loadConfig } from './app-config';

describe('production credentials', () => {
  it('does not use development defaults when the production password is missing', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(
      'DB_PASSWORD must be explicitly set',
    );
  });
  it('accepts an explicitly injected production password', () => {
    expect(
      loadConfig({ NODE_ENV: 'production', DB_PASSWORD: 'injected-test-value' }).DB_PASSWORD,
    ).toBe('injected-test-value');
  });
});

describe('validated application configuration', () => {
  it('coerces supported environment values and uses the canonical database username', () => {
    const config = loadConfig({
      PORT: '8080',
      DB_PORT: '5433',
      DB_USERNAME: 'app_user',
      LOG_LEVEL: 'warn',
    });
    expect(config).toMatchObject({
      PORT: 8080,
      DB_PORT: 5433,
      DB_USERNAME: 'app_user',
      LOG_LEVEL: 'warn',
    });
    expect(config).not.toHaveProperty('DATABASE_URL');
    expect(config).not.toHaveProperty('JWT_SECRET');
  });

  it.each([
    ['PORT', '0'],
    ['PORT', '65536'],
    ['PORT', 'abc'],
    ['PORT', '1.5'],
    ['DB_PORT', ''],
    ['DB_PORT', '-1'],
    ['DB_HOST', ''],
    ['DB_USERNAME', ''],
    ['DB_PASSWORD', ''],
    ['DB_NAME', ''],
    ['LOG_LEVEL', 'invalid'],
    ['NODE_ENV', 'invalid'],
    ['RATE_LIMIT_WINDOW_MS', '0'],
    ['RATE_LIMIT_WINDOW_MS', '2147483648'],
    ['RATE_LIMIT_MAX_REQUESTS', '-1'],
    ['TRUST_PROXY', '11'],
    ['TRUST_PROXY', '-1'],
    ['SHUTDOWN_TIMEOUT_MS', '0'],
    ['DB_CONNECT_TIMEOUT_MS', '0'],
    ['CORS_ORIGINS', 'invalid'],
  ])('rejects invalid %s=%s before startup', (key, value) => {
    expect(() => loadConfig({ [key]: value })).toThrow(`Configuration validation error: ${key}`);
  });

  it('parses CORS allowlists and disables proxy trust by default', () => {
    expect(loadConfig({}).CORS_ORIGINS).toEqual([]);
    expect(loadConfig({}).TRUST_PROXY).toBe(0);
    expect(
      loadConfig({ CORS_ORIGINS: 'https://app.example.test, https://admin.example.test' })
        .CORS_ORIGINS,
    ).toEqual(['https://app.example.test', 'https://admin.example.test']);
  });

  it('does not expose supplied values in configuration errors', () => {
    expect(() => loadConfig({ PORT: 'private-secret-value' })).toThrow(/PORT/);
    try {
      loadConfig({ PORT: 'private-secret-value' });
    } catch (error) {
      expect(String(error)).not.toContain('private-secret-value');
    }
  });
});
