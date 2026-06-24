# Changelog

All notable changes to `propeller-v2-core-ui` are documented here.

---

## [0.3.1] - 2026-06-24

### Documentation

- Added a link to the canonical docs site
  (https://propeller-commerce.github.io/propeller-v2-core-ui/) at the top of the
  README, as the source of truth for types and contracts.

## [0.3.0] - 2026-06-19

### Added

- **Rich CMS model + `CmsProvider` contract promoted from the Next
  boilerplate.** `propeller-next`'s in-production CMS layer had grown a much
  richer contract than core's minimal `CmsAdapter` (3 methods, opaque blocks).
  This release promotes that richer model into `src/types/cms.ts` so the
  accelerator's adapters can express everything a real storefront renders:
  - New `CmsProvider` interface (8 methods + optional `getMenu`): `getPage`,
    `getAllPageSlugs`, `getGlobal`, `getCategoryBanner`, `getArticles`,
    `getArticle`, `getAllArticleSlugs`, `resolveImageUrl`. A strict superset of
    `CmsAdapter`.
  - Typed block catalog `CmsTypedBlock` (15 named blocks: `CmsHeroBanner`,
    `CmsValueProps`, `CmsProductCards`, `CmsFeature`, `CmsFaq`, …) discriminated
    by `_type`.
  - `CmsRichPage` (template + typed blocks + typed SEO), `CmsArticle` /
    `CmsAuthor` (blog), `CmsCategoryBanner`, typed `CmsGlobal` (header/footer),
    `CmsImage`, `CmsSeo`, `CmsPageOptions`.

### Changed

- Nothing removed or renamed. The original `CmsAdapter`, opaque `CmsBlock`,
  `CmsPage`, `CmsMenuItem`, `CmsGlobals`, and `CmsFetchOptions` are unchanged
  and still exported — the generic `cms-react` / `cms-vue` renderers keep
  dispatching on the opaque block. This is a purely additive minor.

### Why

The accelerator's bundled CMS adapters were stuck at the 3-method minimal
contract, which could not express category banners, blog articles, static-slug
enumeration, or image resolution that the boilerplates depend on — so a
scaffolded shop and a boilerplate shop were not interchangeable. Promoting the
boilerplate's proven contract into the shared core makes them converge, and is
what lets the Strapi / Prepr / generic adapters implement the full surface.

## [0.2.4] - 2026-06-04

### Changed

- **SDK dependency switched from GitHub tarball to npm.** Both the
  `peerDependencies` entry and the `devDependencies` test pin now point
  at `@propeller-commerce/propeller-sdk-v2@^0.11.1` instead of
  `github:propeller-commerce/propeller-sdk-v2#master`. All 18 source +
  test files renamed accordingly (`from 'propeller-sdk-v2'` →
  `from '@propeller-commerce/propeller-sdk-v2'`, plus the `/enum`
  subpath).

### Why

The SDK is now published on npm as a properly scoped package. Pinning
via npm removes the GitLab→GitHub mirror dependency from the install
chain and gives consumers semver ranges instead of a moving master tip.
Behaviour is unchanged — the 0.11.0 github tip and the 0.11.1 npm
tarball are export-identical.

## [0.2.3] - 2026-06-04

### Fixed

- **`getLanguageString` now treats empty `value: ''` entries as
  missing.** Previously the function returned the matching entry's
  `value` verbatim — including the empty string — which short-circuited
  the fallback and rendered an invisible product name when the SDK
  returned a placeholder `{ language: 'NL', value: '' }`. The resolver
  now tries the other entries before giving up, matching what consumers
  expect from "localised value missing → use any available
  translation". Downstream effect: `ProductCard`, `CartItem`, and
  bundle/crossupsell name helpers in `propeller-v2-react-ui` and
  `propeller-v2-vue-ui` no longer render blank names against datasets
  with sparse localisation.

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
