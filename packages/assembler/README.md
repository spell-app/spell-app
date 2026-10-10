# `$/assembler` -- assembling pages

The steps between a page's content and its file on disk.
- Shared by every tool that writes pages:  the docs tools, the plan-doc tool.
- One namespace, `AS`.

```ts
import { AS } from "$/assembler"

const linker = new AS.Linker(root)
const { text } = linker.link(html, dirname(file))
writeFileSync(file, await AS.formatHTML(file, text))
```

## The DRY rule (one of each)

If you find yourself writing a second copy of any of these, stop and reuse.

- how a page's links get their targets, and what makes a link bad:  `Linker`
- formatting a page in memory, as `vp fmt` would:  `formatHTML()`
- what a bundle built on demand reads, and whether it's stale:  `Bundle`, `BUNDLES`

## Bundles built on demand

The bundles only the page server serves are NOT committed.
- Why (Owen, 2026-10-07):  their hashed chunk names churned every diff and merge.
- Each is git-ignored, and built when stale:

```ts
for (const bundle of AS.Bundle.all(root)) if (bundle.isStale) bundle.build()
```

- The command line:

  ```sh
  spell dev bundles build [<name>...] [--stale]
  spell dev bundles check [<name>...]
  ```

- The page server runs `spell dev bundles build --stale` when it starts.
  - A request for a bundle's file waits while it runs.
  - That's [BundleBuild.ts](../server/src/page/BundleBuild.ts), in the page server.

| Bundle | Built by | Into |
| --- | --- | --- |
| `ui-site` | `yarn site:bundle` in `packages/ui` | `packages/ui/site/_assets/` |
| `brand` | `yarn build` in `packages/brand` | `packages/brand/_assets/ui/` |

## Files

| File | What |
| --- | --- |
| `src/assembler.types.ts` | `LinkResult`, `LinkCheck`;  `BundleSpec`, `BundleCheck`, `BundleBuilt`, `BundleRecord`, `BUNDLES` |
| `src/Bundle.ts` | `Bundle`:  `all()`, `check()`, `isStale`, `build()`, `sourcesHash()`, `sourceFiles()` |
| `src/Linker.ts` | `Linker`:  `link()`, `check()`, `resolve()`, `targetFor()` |
| `src/format.ts` | `formatHTML()`:  oxfmt in this process |
| `src/index.ts` | the barrel, `AS` |

## Adding a new step

1. A class per capability, `src/<Name>.ts`, its types in `src/assembler.types.ts`.
2. Export it from `src/index.ts`.
3. Its test beside it, `src/<Name>.test.ts` (node).
4. A row in the files table above, and a line in `AGENTS.md` "Overview".

## Deferred

- The page server's assembly code moves in here, so other assembly tools can be built on it
  (e.g. a redone goals package).
  - It's in [the page server's folder](../server/src/page/).
- The docs tools' [pages.js](../docs/tools/pages.js) still has its own copy of the area folders (`AREAS`),
  for `findPages()`.
  `Linker` has the list it indexes.
