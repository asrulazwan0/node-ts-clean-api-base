# A foundation for your next API

A TypeScript and Express starter with PostgreSQL, clean architecture, and a working profile creation example. Start from **v{{version}}**, then add your own product features.

## Start with the stable release

```bash
git clone --branch v{{version}} https://github.com/asrulazwan0/node-ts-clean-api-base.git my-api
cd my-api
npm ci
cp .env.example .env
```

Choose your workflow in the [quickstart](../../README.md). For native development, provision PostgreSQL and update `.env` before running migrations. For the full Docker stack, Compose provides the database and runs migrations before starting the API.

| Workflow | What you need                                 | Start here                                             |
| -------- | --------------------------------------------- | ------------------------------------------------------ |
| Native   | Node.js 24, npm 11, PostgreSQL 16             | [Native quickstart](../../README.md#native-quickstart) |
| Hybrid   | Node.js and npm locally; PostgreSQL in Docker | [Docker workflows](../../README.md#docker-workflows)   |
| Docker   | Docker with Compose v2                        | [Docker workflows](../../README.md#docker-workflows)   |

The published release is the reproducible starting point. `main` contains ongoing documentation and development changes. You can also use GitHub's **Use this template** button to create a repository from the current default branch.

## What you get

- **A complete example:** create a profile with normalized email, validated input, duplicate-email handling, and PostgreSQL persistence.
- **Clear boundaries:** domain rules, application use cases, HTTP controllers, repositories, and explicitly typed dependency injection.
- **Runtime basics:** validated configuration, request IDs, structured logs, consistent errors, health checks, and graceful shutdown.
- **A development pipeline:** unit, HTTP, and isolated database tests; format, lint, types, coverage, dependency checks, and GitHub Actions.
- **Two ways to run:** native development and production, plus Docker development, testing, and a non-root production image.

## Build on the example

Read [architecture and adding a feature](../architecture.md), use the [API reference](api.md), then follow the [development and testing workflows](../development-workflow.md). Deployment configuration, migrations, health checks, and recovery are covered in [operations](../operations.md).

The example is **unauthenticated** and stores profiles, not login credentials. Authentication, authorization, queues, email, caching, file storage, and full CRUD are additions for your project. Review the [security policy](../../SECURITY.md) and [dependency review](../dependency-security.md) before deployment.

## Release and verification

[v{{version}}](https://github.com/asrulazwan0/node-ts-clean-api-base/releases/tag/v{{version}}) is the current stable source release. The [changelog](../../CHANGELOG.md) explains changes; the [release checklist](../release-checklist.md) records verification and remaining limitations. The application is distributed as source and a GitHub template. Docker images are built from that source.

Licensed under [ISC](../../LICENSE). Docker and ECC are optional for native application use.
