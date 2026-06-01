# Changelog

All notable changes to `propeller-v2-core-ui` are documented here.

---

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
