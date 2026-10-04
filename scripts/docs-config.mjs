import { readFile } from 'node:fs/promises';

export const project = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
export const repository = 'https://github.com/asrulazwan0/node-ts-clean-api-base';
export const basePath = process.env.DOCS_BASE_PATH ?? '/node-ts-clean-api-base/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath)) {
  throw new Error(
    'DOCS_BASE_PATH must be / or slash-delimited path segments, with a trailing slash.',
  );
}
export const output = new URL('../.site/', import.meta.url);
export const pages = [
  {
    slug: '',
    label: 'Overview',
    source: 'docs/site/index.md',
    description:
      'A tested TypeScript API foundation. Choose native or Docker development and start from the stable release.',
  },
  {
    slug: 'quickstart',
    label: 'Quickstart',
    source: 'README.md',
    description: 'Run the starter locally with Node.js and PostgreSQL, or with Docker Compose.',
  },
  {
    slug: 'architecture',
    label: 'Architecture',
    source: 'docs/architecture.md',
    description:
      'Understand the layers, dependency injection, persistence, and how to add a feature.',
  },
  {
    slug: 'api',
    label: 'API reference',
    source: 'openapi.json',
    description:
      'Endpoints, request bodies, responses, and schemas generated from the OpenAPI contract.',
  },
  {
    slug: 'workflows',
    label: 'Development & testing',
    source: 'docs/development-workflow.md',
    description: 'Native and Docker workflows, isolated PostgreSQL tests, and quality checks.',
  },
  {
    slug: 'operations',
    label: 'Operations',
    source: 'docs/operations.md',
    description: 'Configuration, migrations, health checks, shutdown, and deployment recovery.',
  },
  {
    slug: 'contributing',
    label: 'Contributing',
    source: 'CONTRIBUTING.md',
    description: 'Development loop, review expectations, test isolation, and supported platforms.',
  },
  {
    slug: 'releases',
    label: 'Changelog',
    source: 'CHANGELOG.md',
    description: 'Release changes, fixes, and compatibility notes.',
  },
  {
    slug: 'security',
    label: 'Security',
    source: 'SECURITY.md',
    description:
      'Supported versions, private vulnerability reporting, and deployment responsibilities.',
  },
  {
    slug: 'dependencies',
    label: 'Dependency review',
    source: 'docs/dependency-security.md',
    description:
      'The current upstream advisory, reachability assessment, and expiring audit exception.',
  },
];
export const pageUrl = (page) => `${basePath}${page.slug ? `${page.slug}/` : ''}`;
