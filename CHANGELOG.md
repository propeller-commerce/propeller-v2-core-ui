# Changelog

All notable changes to `propeller-v2-core-ui` are documented here.

---

## 0.2.2

### Added

- `TranslationProvider` interface + `Locale` / `Namespace` type aliases (`./types/translations`). Apps implement this contract to provide translated labels to UI components via the existing `labels?: Record<string, string>` prop. Sync by design; the file/CMS/TMS choice is the app's.

## [0.2.1] - 2026-06-02

### Added

- **Docusaurus documentation site** under `docs/`, deployed to
  https://propeller-commerce.github.io/propeller-v2-core-ui/ via a new
  `.github/workflows/docs.yml` GitHub Action (build + GitHub Pages
  deploy). Covers getting-started, the type surface, the utility
  catalogue, the SDK seam (`createServices`), and the `Result<T>`
  contract design rationale.
- **`release_to_github` stage in `.gitlab-ci.yml`** — automatic GitHub
  Release on every `Release X.Y.Z` push, mirroring the SDK pattern.
  Idempotent (skips if the `v<version>` tag already exists) and gated
  on a non-"Unreleased" CHANGELOG section. Body is auto-extracted from
  this file.

### Notes

No runtime / public-API changes — this is a tooling release that
backfills documentation + release automation for the existing 0.2.0
surface. Consumers do not need to update.

## [0.2.0] - 2026-06-01

Adds the framework-agnostic CMS adapter contract and the `userMode` helper
that consumers (commerce UI packages, CMS packages, accelerator templates)
build on. Additive — no existing exports changed.

### Added

- **`CmsAdapter` interface** + supporting types (`CmsPage`, `CmsBlock`,
  `CmsMenuItem`, `CmsGlobals`, `CmsFetchOptions`) in `types/cms.ts`. Defines
  the three methods every CMS adapter implementation must expose:
  `getPage(slug, opts?)`, `getMenu(name, opts?)`, `getGlobals(opts?)`.
  Framework-agnostic; consumed by `propeller-v2-cms-react`,
  `propeller-v2-cms-vue`, and downstream adapter packages
  (`propeller-cms-adapter-strapi`, etc.).
- **`deriveUserMode(user, shopMode)`** in `utils/userMode.ts`, returning
  `'anonymous' | 'b2b' | 'b2c'`. Built on the existing
  `isContact`/`isCustomer` discriminators. Hybrid shops branch on SDK user
  type at runtime; pure `b2b`/`b2c` shops short-circuit regardless of who's
  logged in. Used by `propeller-v2-react-ui` and `propeller-v2-vue-ui` to
  expose a derived `userMode` field on `PropellerInfra` so consumer UI can
  branch consistently (`userMode === 'b2b'`) instead of re-deriving from
  `isContact(user)` ad hoc.
- **`ShopMode`** and **`UserMode`** type exports for downstream packages.

### Why this matters

The CMS contract lives in core (not in either UI package) so commerce
components stay focused on commerce, and any new framework binding (Svelte,
Solid, future) inherits the same contract for free. `userMode` is the
single place that turns SDK user-type discrimination into a shop-mode-aware
gating decision — the upcoming accelerator templates rely on this to gate
B2B-only routes (quotes, authorization, contacts) for `Customer` sessions
in hybrid shops.

---

## [0.1.0] - 2026-05-20

Initial extraction from the React and Vue UI packages. Pure-TS framework-agnostic
core: domain types, formatting helpers, attribute extractors, language
resolution, user identity discriminators, content-visibility helper, JSON-LD
builders, the `Services` SDK seam, and the `Result<T>` contract.
