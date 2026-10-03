import { describe, expect, it } from 'vitest';
import { PinoLoggerAdapter } from './logger';
import { loadConfig } from '../config/app-config';

describe('structured logging', () => {
  it('preserves structured fields and redacts secret fields at every level', () => {
    const lines: string[] = [];
    const logger = new PinoLoggerAdapter(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'debug' }), {
      write: (line: string) => {
        lines.push(line);
      },
    });
    logger.info('request', {
      requestId: 'id-123',
      password: 'secret',
      token: 'secret',
      user: { password: 'secret' },
      req: { headers: { authorization: 'secret', cookie: 'secret' } },
    });
    logger.warn('warning');
    logger.error('failure', { code: 'SAFE_CODE' });
    logger.debug('debug');
    expect(lines).toHaveLength(4);
    expect(JSON.parse(lines[0]!)).toMatchObject({
      msg: 'request',
      requestId: 'id-123',
      password: '[REDACTED]',
    });
    expect(lines.join('')).not.toContain('secret');
    expect(JSON.parse(lines[2]!)).toMatchObject({ msg: 'failure', code: 'SAFE_CODE' });
  });
});
