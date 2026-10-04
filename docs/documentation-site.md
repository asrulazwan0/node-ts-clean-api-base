# Documentation website

The documentation site lives at <https://asrulazwan0.github.io/node-ts-clean-api-base/>. It presents the current `main` documentation alongside the stable API baseline; it does not run the API or replace the tagged source release.

## Content and local preview

The quickstart, architecture, workflows, operations, contribution, changelog, security, and dependency pages use existing repository Markdown as their source. The overview is in `docs/site/index.md`. The API reference is generated from `openapi.json`; the unchanged specification is also available for download.

```bash
npm ci
npm run docs:build
npm run docs:preview
```

Open <http://127.0.0.1:4173/node-ts-clean-api-base/>. Node.js 24 and npm 11 are sufficient. Neither PostgreSQL nor Docker is needed for the website. `DOCS_PORT` changes the local preview port.

The build writes ignored output to `.site/` and checks generated internal links, assets, duplicate IDs, and section anchors. Markdown links to pages outside the website open their source on GitHub. Website navigation and document content work without JavaScript; JavaScript adds search, code copying, and a compact mobile menu. No external scripts or fonts are required.

`scripts/docs-config.mjs` defines the navigation and source mappings. `docs/site/site.css` and `docs/site/site.js` define the presentation and enhancements. `marked` is a development dependency and is removed from the production API image with other development dependencies.

## Publishing

The `Documentation` workflow builds and checks pull requests. Only pushes to upstream `main`, or a manual dispatch on upstream `main`, can publish to the `github-pages` environment. GitHub Pages uses **GitHub Actions** as its source. Deployment permissions are limited to the deploy job; Actions are pinned to commit SHAs.

The initial publication is tracked in the pull request adding this site. A deployment is complete only when the Actions deployment succeeds and the public URL serves the generated pages and assets. No application release tag is needed for documentation changes. Existing release tags stay unchanged.

## Initial verification

Local verification on 2026-10-04 covered:

- Ten generated pages and 262 internal links/assets, built at both the repository prefix and `/`.
- Chromium checks on all ten pages at widths of 1440, 390, and 320 pixels, with no page overflow or failed requests.
- Search results and navigation, code copying, skip-to-content keyboard navigation, mobile menu controls, and Escape returning focus to the menu button.
- Usable mobile navigation and content with JavaScript disabled, and the downloadable OpenAPI version matching `1.0.1`.
- Automated axe checks on all ten pages at those widths with no violations of the selected WCAG A/AA rules. This is automated evidence, not a complete accessibility conformance audit.
- `npm run check` and the existing dependency-policy audit; the documented upstream exception remains unchanged.

GitHub Actions records the documentation build, deployment, and existing application checks for the publishing commit. Publication verification must additionally check the live URL after deployment.

## Projects created from this template

Publication is guarded by the exact upstream repository name. A new project can build the documentation but will not publish to Pages automatically. It can remove `docs.yml` and the website scripts/assets if it does not need this website.

To publish its own site, update the repository URL, canonical URL, base path, overview links, and deployment guard; replace starter-specific content and reporting policies. Then enable Pages with GitHub Actions as the source in that project's settings. Do not keep the upstream identity in a consumer project's website.

The default base path is `/node-ts-clean-api-base/`. Set `DOCS_BASE_PATH` to a slash-delimited path with a trailing slash when building and previewing at a different path, for example `/` for a root site. Configure the same value in CI. For a custom domain, also update the canonical URL generation.

## Troubleshooting

- A missing internal file or section anchor fails the build. Fix the source link or the page mapping rather than disabling verification.
- A deployment failure after a successful build may indicate that Pages is disabled or its source is not GitHub Actions. Check repository Pages settings and the `github-pages` environment policy.
- Missing styles or search after deployment usually indicate a mismatched base path. Build and preview under the same repository prefix as the public website.
- A failed clipboard permission leaves code readable and selectable. Search failure leaves document navigation available.
