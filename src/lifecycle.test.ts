import { createServer, type Server } from 'node:http';
import { type AddressInfo } from 'node:net';
import { describe, expect, it, vi } from 'vitest';
import { shutdownServer } from './lifecycle';

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe('graceful shutdown', () => {
  it('reports a server-close error instead of disconnecting under an invalid lifecycle', async () => {
    const disconnect = vi.fn(async () => undefined);
    await expect(shutdownServer(createServer(), disconnect, 1000)).rejects.toMatchObject({
      code: 'ERR_SERVER_NOT_RUNNING',
    });
    expect(disconnect).not.toHaveBeenCalled();
  });
  it('allows an active response to finish before disconnecting persistence', async () => {
    let finishResponse!: () => void;
    let markReceived!: () => void;
    const received = new Promise<void>((resolve) => {
      markReceived = resolve;
    });
    const server = createServer((_req, res) => {
      finishResponse = () => res.end('finished');
      markReceived();
    });
    const origin = await listen(server);
    const response = fetch(origin).then((res) => res.text());
    await received;
    const disconnect = vi.fn(async () => undefined);
    const shutdown = shutdownServer(server, disconnect, 1000);
    expect(disconnect).not.toHaveBeenCalled();
    finishResponse();
    expect(await response).toBe('finished');
    await shutdown;
    expect(disconnect).toHaveBeenCalledOnce();
    expect(server.listening).toBe(false);
  });

  it('forces closed connections and reports failure when a request exceeds the deadline', async () => {
    let markReceived!: () => void;
    const received = new Promise<void>((resolve) => {
      markReceived = resolve;
    });
    const server = createServer(() => markReceived());
    const origin = await listen(server);
    const response = fetch(origin).catch(() => null);
    await received;
    await expect(shutdownServer(server, async () => undefined, 20)).rejects.toThrow('deadline');
    await response;
    expect(server.listening).toBe(false);
  });

  it('also bounds a stalled database disconnect', async () => {
    const server = createServer();
    await listen(server);
    await expect(shutdownServer(server, () => new Promise(() => {}), 20)).rejects.toThrow(
      'deadline',
    );
  });
});
