import { type Server } from 'node:http';
import { createApp, createAppContainer, type AppContainer } from './app';
import { shutdownServer } from './lifecycle';
import { loadConfig } from './infrastructure/config/app-config';

export interface RunningApplication {
  server: Server;
  container: AppContainer;
  shutdown(): Promise<void>;
}

/** Connect infrastructure and listen. Importing this module has no startup side effects. */
export async function bootstrap(
  container = createAppContainer(loadConfig()),
): Promise<RunningApplication> {
  const { database, logger, config } = container.cradle;
  await database.connect();
  let server: Server;
  try {
    const app = createApp(container);
    server = await new Promise<Server>((resolve, reject) => {
      const listener = app.listen(config.PORT);
      listener.once('listening', () => resolve(listener));
      listener.once('error', reject);
    });
  } catch (error) {
    await database.disconnect();
    throw error;
  }
  logger.info(`Server listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
  let shutdownPromise: Promise<void> | undefined;
  return {
    server,
    container,
    shutdown() {
      shutdownPromise ??= (async () => {
        await shutdownServer(server, () => database.disconnect(), config.SHUTDOWN_TIMEOUT_MS);
        await container.dispose();
      })();
      return shutdownPromise;
    },
  };
}

async function main(): Promise<void> {
  const runtime = await bootstrap();
  const stop = () => {
    void runtime.shutdown().catch(() => {
      runtime.container.cradle.logger.error('Shutdown failed');
      process.exit(1);
    });
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error('Bootstrap failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exitCode = 1;
  });
}
