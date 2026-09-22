# Changelog

All notable changes to `propeller-v2-core-ui` are documented here.

---

## [0.8.0] - 2026-09-22

### Changed

- **`getLabel` keeps an intentionally empty label** instead of falling back.
  It resolved `labels?.[key] || fallback`, so `""` — the normal way to hide a
  label — was replaced by the English default and a label could not be blanked.
  Now `??`, so only a genuinely absent key falls back.

  This was live: `AccountIconAndMenu` requests `loginSubtitle` at two sites,
  one with an empty fallback and one with `'Login to access your account'`.
  nextDemo sets `loginSubtitle: ""` in both `en` and `nl`, so the blanking
  worked at the first site and was silently discarded at the second — showing
  English in the Dutch UI.

  A locale that relied on `""` meaning "use the English default" will now
  render an empty string. Remove the key instead to get the fallback.

### Added

- **`getLabel` warns on a missing key in development** (`NODE_ENV === 'development'`,
  once per key). The fallbacks are English, so a key absent from a shipped
  locale renders English inside an otherwise translated page and reads as a
  translation rather than a gap. Two live examples found this way:
  `totalExclVat` missing from the `CartIconAndSidebar` namespace, and
  `closeFilters` missing from every namespace. (PWP-987)

## [0.7.0] - 2026-08-26

### Added

- **`localeForLanguage(language)`** — maps a storefront language code to the
  BCP-47 locale used to format its numbers and dates (`EN` → `en-GB`, `NL` →
  `nl-NL`, …). An explicit tag containing a `-` is returned unchanged, so a shop
  can pin `en-US` over `en-GB` itself. Currency and number formatting were two
  independent decisions and only the currency was reachable: every caller left
  `formatPrice`'s locale at its `nl-NL` default, so an English storefront
  rendered `£ 3,45`.

### Changed

- **`formatPrice` places the symbol the way the locale does.** The explicit-
  symbol branch hardcoded `${symbol} ${amount}`, which is right for `nl-NL`
  (`€ 9,50`) and wrong everywhere else (`£ 3,45` instead of `£3.45`). It now
  lays the amount out with `Intl.NumberFormat`'s own currency pattern and
  substitutes the caller's glyph. Dutch output is byte-identical — the
  non-breaking space Intl emits is normalised back to a plain space — so only
  non-Dutch locales change.
- **`AddToCartComponentProps.onAddToCart` matches the component it feeds.** It
  declared `(product, quantity?, notes?)` while `AddToCart` calls
  `(product, clusterId?, quantity?, childItems?, notes?, price?, showModal?)`:
  argument 2 meant `clusterId` in one and `quantity` in the other, so a
  component written against the slot contract could not forward the prop to the
  real `<AddToCart>`. Widening is backwards compatible — an implementation
  taking fewer parameters still satisfies it.

## [0.6.2] - 2026-08-10

### Added

- **`getNettedBonusItems(items)`** — nets an order's bonus items against their
  `incentive` siblings. The API models a bonus as two lines: the product line at
  its list price, plus a sibling `class: 'incentive'` line carrying the negative
  delta and pointing back via `parentOrderItemId`. Consumers that rendered only
  the product line showed the undiscounted price on order surfaces, while the
  cart (which receives a pre-netted `bonusItems` collection) showed 0. The
  helper folds each discount into its parent, so a fully discounted item reaches
  0 and a partially discounted one keeps the remainder.

## [0.6.1] - 2026-08-07

### Fixed

- **ENUM cluster configurators render their options again.**
  `extractAttributeValues` resolved `AttributeEnumValue` via `value`, but the
  schema exposes enum values on `enumValues: [String]` (there is no `value`
  field on that type). Every ENUM attribute therefore returned an empty list,
  so a cluster spanned by ENUM attributes rendered its dropdown with only the
  "— Select —" placeholder and no variant could be chosen. Now reads
  `enumValues`, with the legacy `value` kept as a fallback. (Originally fixed as
  0.4.1, which was never published — the fix was orphaned when 0.5.0/0.6.0
  shipped without it.)

## [0.6.0] - 2026-08-06

### Changed

- **BREAKING — `buildInventoryFilter` filters by a threshold, not two
  buckets.** It now takes a single selection plus an optional minimum
  quantity, and `Availability` is `'all' | 'in-stock'`. The `'out-of-stock'`
  bucket is gone.

  ```ts
  // before
  buildInventoryFilter(['in-stock'])          // { totalQuantity: { greaterThan: 1 } }
  buildInventoryFilter(['out-of-stock'])      // { totalQuantity: { equal: 0 } }
  buildInventoryFilter([])                    // undefined

  // after
  buildInventoryFilter('in-stock')            // { totalQuantity: { greaterThan: 1 } }
  buildInventoryFilter('in-stock', 5)         // { totalQuantity: { greaterThan: 5 } }
  buildInventoryFilter('all')                 // undefined
  ```

  The two-checkbox model could express "in stock or out of stock", which is
  every product and so had to collapse to no filter — a control with a state
  that did nothing. It also could not express a quantity, which is the more
  common question once a shopper knows an item is stocked.

  `greaterThan` stays inclusive, and the quantity defaults to 1, so a caller
  that passes no quantity gets exactly the previous in-stock behaviour. The
  value is floored and clamped to a minimum of 1: a lower threshold would
  match zero-stock products and contradict the control.

  **To upgrade:** pass `'in-stock'` where you passed `['in-stock']`, and
  `'all'` (or `undefined`) where you passed `[]` or both buckets. There is no
  replacement for `['out-of-stock']`.

### Added

- **`MIN_STOCK_THRESHOLD`** — the smallest quantity that still means "in
  stock", exported so hosts can bound their own quantity inputs to the same
  value the filter clamps to.

## [0.5.0] - 2026-08-05

### Added

- **`buildInventoryFilter(selection)`** and the **`Availability`** type
  (`'in-stock' | 'out-of-stock'`) — map a shopper-facing stock selection to the
  server-side `ProductSearchInventoryFilterInput` the SDK exposes on
  `ProductSearchInput` and `CategoryProductSearchInput`. The React and Vue
  packages both call this, so the operator semantics live in one place and
  cannot drift between them.

  The operators are inclusive despite their names: `greaterThan: N` matches
  stock `>= N` and `lessThan: N` matches stock `<= N`. Products that were never
  stocked have no inventory record and count as 0. So in stock is
  `{ totalQuantity: { greaterThan: 1 } }` and out of stock is
  `{ totalQuantity: { equal: 0 } }` — deliberately *not* `lessThan: 1`, which
  means `<= 1` and would also match products with exactly one remaining.

  Selecting both buckets means "in stock or out of stock", which is every
  product. There is no OR operator on the filter and the union is the
  unfiltered set anyway, so both-selected returns `undefined` — the same as
  selecting neither.

### Changed

- Bumped the SDK dev dependency to `^0.16.0`, where the inventory filter types
  land. The runtime peer stays `*`.

---

## [0.4.0] - 2026-07-29

### Changed

- **Align with `@propeller-commerce/propeller-sdk-v2` 0.14.0**, which removed the
  entire deprecated schema surface. `buildProductJsonLd` / `buildClusterJsonLd`
  now read the plural localized `category.names` (was `category.name`), and
  `buildItemListJsonLd` unwraps clusters via `item.type === ProductClass.CLUSTER`
  (was `item.class`). Cluster SKU is taken from `defaultProduct?.sku` only
  (`Cluster.sku` was removed). Bumped the SDK dev dependency to `^0.14.0`; the
  runtime peer stays `*`.

---

## [0.3.2] - 2026-07-08

### Changed

- Bumped the `@propeller-commerce/propeller-sdk-v2` dev dependency to `^0.12.0`
  to build and test against the SDK's 0.12.0 release. The runtime peer stays
  `*` — consumers pin the SDK version. No API change.

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
