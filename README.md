# propeller-v2-core-ui

Framework-agnostic core for the Propeller Commerce UI packages.

📖 **Docs (canonical reference for types & contracts):** https://propeller-commerce.github.io/propeller-v2-core-ui/

Pure TypeScript — no Vue, no React, no browser APIs. Safe to import from any
runtime (Node SSR, build scripts, tests). Consumed by:

- [`propeller-v2-vue-ui`](https://github.com/propeller-commerce/propeller-v2-vue-ui)
- [`propeller-v2-react-ui`](https://github.com/propeller-commerce/propeller-v2-react-ui)

## What lives here

| Surface | Purpose |
|---|---|
| `types/` | Domain shapes (`auth`, `cart`, `company`, `favorites`, `orders`, `pagination`, `product`) plus the `Result<T, E>` contract |
| `utils/` | Pure helpers: formatting, attribute extraction, user identity (Contact vs Customer), countries, language resolution, JSON-LD builders, video URL normalization, visibility helpers, truncation, inventory status, label fallback |
| `services/` | `createServices(client)` — the single SDK seam, memoized per `GraphQLClient`. Plus `toPlain` for normalizing class-instance serialization. |

The `Result<T, E>` discriminated union is the package-wide contract for
mutations. Reads throw; writes return `Result`.

## Install

```bash
npm install github:propeller-commerce/propeller-v2-core-ui#master
```

Peer dep: `propeller-sdk-v2`.

## Build

```bash
npm install
npm run build         # tsup → dist/{index.js,index.cjs,index.d.ts}
npm run typecheck     # tsc --noEmit
npm test              # vitest (Node env — SSR-safe by construction)
```

## License

MIT
