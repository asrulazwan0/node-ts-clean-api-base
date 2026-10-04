import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { basePath, output } from './docs-config.mjs';

const root = fileURLToPath(output);
const port = Number(process.env.DOCS_PORT ?? 4173);
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/' && basePath !== '/') {
      response.writeHead(302, { Location: basePath }).end();
      return;
    }
    if (!url.pathname.startsWith(basePath)) throw new Error('Not found');
    const relative = decodeURIComponent(url.pathname.slice(basePath.length));
    const file = path.resolve(
      root,
      relative.endsWith('/') || !relative ? `${relative}index.html` : relative,
    );
    if (!file.startsWith(root)) throw new Error('Not found');
    const body = await readFile(file);
    response
      .writeHead(200, {
        'Content-Type': `${types[path.extname(file)] ?? 'application/octet-stream'}; charset=utf-8`,
      })
      .end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Documentation preview: http://127.0.0.1:${port}${basePath}`),
);
