import { type Server } from 'node:http';

/** Stop accepting requests, drain active HTTP requests, then close persistence. */
export async function shutdownServer(
  server: Server,
  disconnect: () => Promise<void>,
  timeoutMs: number,
): Promise<void> {
  // Responses already in flight must not start a new keep-alive window while draining.
  server.keepAliveTimeout = 1;
  server.keepAliveTimeoutBuffer = 0;
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      server.closeAllConnections();
      reject(new Error(`Shutdown exceeded ${timeoutMs}ms deadline`));
    }, timeoutMs);
  });
  try {
    await Promise.race([
      (async () => {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          server.closeIdleConnections();
        });
        await disconnect();
      })(),
      deadline,
    ]);
  } finally {
    clearTimeout(timer);
  }
}
