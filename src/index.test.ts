import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';
import { describe, expect, it, vi } from 'vitest';
import { createAppContainer } from './app';
import { bootstrap } from './index';
import { loadConfig } from './infrastructure/config/app-config';
import { DatabaseConnection } from './infrastructure/database/database-connection';

function fixture() {
  const config = { ...loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }), PORT: 0 };
  const database = new DatabaseConnection(config);
  const connect = vi.spyOn(database, 'connect').mockResolvedValue();
  const disconnect = vi.spyOn(database, 'disconnect').mockResolvedValue();
  const container = createAppContainer(config, { database });
  return { config, database, connect, disconnect, container };
}

describe('application startup lifecycle', () => {
  it('connects before listening and provides idempotent shutdown', async () => {
    const { container, connect, disconnect } = fixture();
    const runtime = await bootstrap(container);
    expect(connect).toHaveBeenCalledOnce();
    expect(runtime.server.listening).toBe(true);
    const first = runtime.shutdown();
    const second = runtime.shutdown();
    expect(first).toBe(second);
    await first;
    expect(disconnect).toHaveBeenCalledOnce();
    expect(runtime.server.listening).toBe(false);
  });

  it('closes the database if the HTTP port cannot be opened', async () => {
    const occupied = createServer();
    await new Promise<void>((resolve) => occupied.listen(0, resolve));
    try {
      const { container, config, disconnect } = fixture();
      config.PORT = (occupied.address() as AddressInfo).port;
      await expect(bootstrap(container)).rejects.toMatchObject({ code: 'EADDRINUSE' });
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      await new Promise<void>((resolve) => occupied.close(() => resolve()));
    }
  });

  it('rejects startup when persistence cannot connect', async () => {
    const { container, connect } = fixture();
    connect.mockRejectedValue(new Error('database unavailable'));
    await expect(bootstrap(container)).rejects.toThrow('database unavailable');
  });
});
