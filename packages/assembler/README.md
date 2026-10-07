# `$/assembler` -- assembling pages

The steps between a page's content and its file on disk, shared by every tool that writes pages (the docs tools,
the plan-doc tool).  One namespace, `AS`.

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

## Files

| File | What |
| --- | --- |
| `src/assembler.types.ts` | `LinkResult`, `LinkCheck` |
| `src/Linker.ts` | `Linker`:  `link()`, `check()`, `resolve()`, `targetFor()` |
| `src/format.ts` | `formatHTML()`:  oxfmt in this process |
| `src/index.ts` | the barrel, `AS` |

## Adding a new step

1. A class per capability, `src/<Name>.ts`, its types in `src/assembler.types.ts`.
2. Export it from `src/index.ts`.
3. Its test beside it, `src/<Name>.test.ts` (node).
4. A row in the files table above, and a line in `AGENTS.md` "Overview".

## Deferred

- The page server's assembly code (`packages/server/src/page/`) moves in here, so other assembly tools can be built on
  it (e.g. a redone goals package).
- `packages/docs/tools/pages.js` still has its own copy of the area folders (`AREAS`) for `findPages()`;  `Linker`
  has the list it indexes.
