# Security policy

This is a minimal API starter. It does not implement authentication, authorization, or a complete deployment security policy. Projects built from it must define access controls appropriate to their data and deployment.

## Supported versions

Release preparation is in progress; see [the readiness tracker](docs/release-checklist.md). Once a verified release is published, security fixes target the latest published release. There is no commitment to backport fixes to older versions or to a fixed response time.

## Reporting a vulnerability

As inspected on 2026-10-03, GitHub private vulnerability reporting is disabled for this repository, and no alternative private contact has been verified. Maintainers must enable and verify a private reporting channel before a public stable release. After it is enabled, use **Security → Advisories → Report a vulnerability** for private reports. Do not put credentials, sensitive data, or exploitable vulnerability details in public issues.

While private reporting is unavailable, open only a minimal, non-sensitive public issue requesting a private security contact, without including vulnerability details. No unverified email address is provided here. Repositories created from this template must configure their own reporting channel and replace this repository-specific status.

A private report should describe the affected version/commit, impact, minimal reproduction using synthetic data, and any suggested fix. Remove secrets and personal information from logs or attachments.

## Deployment responsibilities

- Replace local example credentials and supply secrets at runtime.
- Use TLS at the deployment ingress and restrict database network access.
- Configure allowed CORS origins and trusted proxies for your actual topology; CORS is not authentication.
- The default rate-limit store is process-local. Multi-instance deployments need coordinated enforcement if a global limit is required.
- Review logs, data retention, backups, dependency updates, and migration permissions.
- Use a separate disposable database for integration tests.

See [operations](docs/operations.md) for configuration and migration recovery. Please coordinate public disclosure with maintainers through the private channel when one is available.
