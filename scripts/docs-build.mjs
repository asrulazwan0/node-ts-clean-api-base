import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked, Renderer } from 'marked';
import { basePath, output, pages, pageUrl, project, repository } from './docs-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const plain = (value) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const code = (value, language = 'json') =>
  `\n\n\`\`\`${language}\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;

function apiMarkdown(spec) {
  let markdown = `# API reference\n\n${spec.info.description}\n\nGenerated from [openapi.json](../../openapi.json), version **${spec.info.version}**. Download the contract to use it with your preferred OpenAPI tools. The documentation website does not host an API.\n\nLocal base URL: \`${spec.servers[0].url}\`.\n`;
  for (const [route, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      markdown += `\n## ${method.toUpperCase()} ${route}\n\n${operation.summary}\n\n${operation.description ?? ''}\n`;
      const body = operation.requestBody?.content?.['application/json'];
      if (body) {
        markdown += `\n### Request body\n\nContent type: \`application/json\`. ${operation.requestBody.required ? 'Required.' : 'Optional.'}\n`;
        if (body.example) markdown += code(body.example);
        markdown += `\nRequest schema:${code(body.schema)}`;
      }
      markdown += '\n### Responses\n\n| Status | Meaning | JSON schema |\n| --- | --- | --- |\n';
      for (const [status, response] of Object.entries(operation.responses)) {
        const schema = response.content?.['application/json']?.schema;
        const reference = schema?.$ref?.split('/').at(-1);
        markdown += `| ${status} | ${response.description.replaceAll('|', '\\|')} | ${reference ? `[${reference}](#${reference.toLowerCase()})` : 'Shown below'} |\n`;
      }
      for (const [status, response] of Object.entries(operation.responses)) {
        const schema = response.content?.['application/json']?.schema;
        if (schema && !schema.$ref) markdown += `\n${status} response schema:${code(schema)}`;
      }
    }
  }
  markdown += '\n## Shared schemas\n';
  for (const [name, schema] of Object.entries(spec.components.schemas))
    markdown += `\n### ${name}\n${code(schema)}`;
  return markdown;
}

await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
for (const asset of ['site.css', 'site.js', 'theme.js', 'favicon.svg']) {
  await copyFile(
    new URL(`../docs/site/${asset}`, import.meta.url),
    new URL(`assets/${asset}`, output),
  );
}
await copyFile(new URL('../openapi.json', import.meta.url), new URL('openapi.json', output));
await writeFile(new URL('.nojekyll', output), '');

const search = [];
const rendered = [];
for (const page of pages) {
  const headings = [];
  const ids = new Map();
  const renderer = new Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const label = plain(this.parser.parseInline(tokens));
    const slug = label
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-');
    const count = ids.get(slug) ?? 0;
    ids.set(slug, count + 1);
    const id = `${slug}${count ? `-${count}` : ''}`;
    headings.push({ id, label, depth });
    return `<h${depth} id="${escape(id)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
  };
  renderer.html = ({ text }) => escape(text);
  renderer.code = ({ text, lang }) =>
    `<pre tabindex="0" aria-label="${escape(lang || 'Code')} example"><code>${escape(text)}</code></pre>\n`;
  renderer.table = function (token) {
    return `<div class="table-scroll" tabindex="0" role="region" aria-label="Documentation table">${Renderer.prototype.table.call(this, token)}</div>`;
  };
  renderer.link = function ({ href, title, tokens }) {
    let target = href;
    if (!/^(https?:|mailto:|#)/i.test(href)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//'))
        throw new Error(`Unsupported link: ${href}`);
      const [local, fragment] = href.split('#');
      const source = path.posix.normalize(
        path.posix.join(
          path.posix.dirname(page.source === 'openapi.json' ? 'docs/site/api.md' : page.source),
          decodeURIComponent(local),
        ),
      );
      const linked =
        source === 'docs/site/api.md'
          ? pages.find((item) => item.slug === 'api')
          : pages.find((item) => item.source === source);
      if (source === 'openapi.json') target = `${basePath}openapi.json`;
      else if (linked) target = pageUrl(linked);
      else {
        if (source.startsWith('../')) throw new Error(`Link outside repository: ${href}`);
        if (!existsSync(path.join(root, source))) throw new Error(`Missing source link: ${href}`);
        target = `${repository}/blob/main/${source.split('/').map(encodeURIComponent).join('/')}`;
      }
      if (fragment) target += `#${fragment}`;
    }
    return `<a href="${escape(target)}"${title ? ` title="${escape(title)}"` : ''}>${this.parser.parseInline(tokens)}</a>`;
  };
  const marked = new Marked({ renderer, gfm: true });
  const source = await readFile(path.join(root, page.source), 'utf8');
  const markdown = (page.slug === 'api' ? apiMarkdown(JSON.parse(source)) : source).replaceAll(
    '{{version}}',
    project.version,
  );
  const body = marked.parse(markdown);
  const toc = headings.filter((heading) => heading.depth === 2);
  const index = pages.indexOf(page);
  const navigation = pages
    .map(
      (item) =>
        `<a href="${pageUrl(item)}"${item === page ? ' aria-current="page"' : ''}>${escape(item.label)}</a>`,
    )
    .join('');
  const neighbor = (item, caption) =>
    item
      ? `<a href="${pageUrl(item)}"><span>${caption}</span>${escape(item.label)}</a>`
      : '<span></span>';
  const canonical = `https://asrulazwan0.github.io${pageUrl(page)}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.label)} · Clean API Starter</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${canonical}"><link rel="icon" href="${basePath}assets/favicon.svg" type="image/svg+xml"><script src="${basePath}assets/theme.js"></script><link rel="stylesheet" href="${basePath}assets/site.css"><script src="${basePath}assets/site.js" defer></script></head>
<body data-base="${basePath}"><a class="skip-link" href="#content">Skip to content</a>
<header class="header"><a class="brand" href="${basePath}"><span class="brand-icon" aria-hidden="true">{ }</span><span>Clean API<span class="brand-caption">TypeScript starter</span></span></a><div class="header-links"><a class="version" href="${repository}/releases/tag/v${project.version}">v${project.version}</a><a class="repository-link" href="${repository}" aria-label="GitHub repository" title="GitHub repository"><span class="repository-label">GitHub</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M14 3h7v7M21 3l-10 10M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6"/></svg></a><button id="theme-toggle" class="theme-toggle" type="button" aria-label="Dark mode" aria-pressed="false" hidden><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></button><button id="menu-toggle" aria-expanded="false" aria-controls="sidebar" hidden>Menu</button></div></header>
<div class="layout"><aside id="sidebar" class="sidebar"><form id="search-form" role="search" hidden><label for="search-input">Search documentation</label><input id="search-input" type="search" placeholder="Search guides…" autocomplete="off"><p id="search-status" role="status"></p><ul id="search-results"></ul></form><nav aria-label="Documentation"><p class="nav-caption">DOCUMENTATION</p>${navigation}</nav><a class="sidebar-footer" href="${repository}/releases">Release archives <span aria-hidden="true">↗</span></a></aside>
<main id="content" tabindex="-1"><div class="page-meta">GUIDE <span>API baseline v${project.version}</span></div><article>${body}</article><nav class="page-neighbors" aria-label="Previous and next pages">${neighbor(pages[index - 1], 'Previous')}${neighbor(pages[index + 1], 'Next')}</nav><footer class="page-footer"><a href="${repository}/blob/main/${page.source}">View source on GitHub</a><span>Docs from main · ISC license</span></footer></main>
<aside class="toc"><nav aria-label="On this page"><p class="nav-caption">ON THIS PAGE</p>${toc.map((heading) => `<a href="#${escape(heading.id)}">${escape(heading.label)}</a>`).join('')}</nav></aside></div><div class="sr-only" id="copy-status" role="status"></div></body></html>`;
  const directory = new URL(page.slug ? `${page.slug}/` : './', output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), html);
  rendered.push({ page, html });
  const sections = body.split(/(?=<h2\b)/);
  sections.forEach((section, sectionIndex) => {
    const heading = section.match(/^<h2 id="([^"]+)">([\s\S]*?)<\/h2>/);
    search.push({
      title: `${page.label}${heading ? ` · ${plain(heading[2])}` : ''}`,
      url: `${pageUrl(page)}${heading ? `#${heading[1]}` : ''}`,
      text: plain(section),
      order: sectionIndex,
    });
  });
}
await writeFile(new URL('assets/search.json', output), JSON.stringify(search));

// Verify actual generated links and fragments, including deployment under a repository prefix.
let links = 0;
for (const { page, html } of rendered) {
  const duplicateIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(duplicateIds).size !== duplicateIds.length)
    throw new Error(`Duplicate IDs in ${page.label}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href.startsWith(basePath) && !href.startsWith('#')) continue;
    const url = new URL(href, `https://docs.test${pageUrl(page)}`);
    const relative = decodeURIComponent(url.pathname.slice(basePath.length));
    const target = new URL(
      relative.endsWith('/') || relative === '' ? `${relative}index.html` : relative,
      output,
    );
    if (!(await stat(target)).isFile()) throw new Error(`Missing target in ${page.label}: ${href}`);
    if (url.hash) {
      const content = await readFile(target, 'utf8');
      if (!content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))
        throw new Error(`Missing fragment in ${page.label}: ${href}`);
    }
    links++;
  }
}
console.log(
  `Built ${pages.length} documentation pages; verified ${links} local links and assets at ${basePath}. Output: .site/`,
);
