import { transformAsync as compileSolidJsx } from "@solidjs/compiler"
import { transform } from "esbuild"

/**
 * Compiled spell's Solid TypeScript (the `ts/solid` target, a `.compiled.tsx`) built into JavaScript that runs:
 * the build a hand-written Solid app gets from Vite, in two steps.
 *   1. esbuild, as `vite.decorators.ts` (repo root) does:  strips the types and lowers standard decorators
 *      (`@prop`, `@drawn` ...), keeping the JSX and the class names (`keepNames`:  `Thing.type` reads them)
 *   2. Solid's compiler (`@solidjs/compiler`):  the JSX becomes Solid's DOM calls (`template()`, `insert()` ...),
 *      imported from `@solidjs/web`
 * - Returns an ES module's code, to run as a `.mjs`.  It imports `@spell/core`, `solid-js` and `@solidjs/web`:  the
 *   runner MUST resolve the last two to the copy `@spell/core` draws with (`cli`'s `hooks.mjs`), or the page gets
 *   two Solids, which fail silently.
 * - Why this order:  the app's own, where `vite.decorators.ts` runs before Solid's plugin.  Solid's compiler takes
 *   TypeScript too (keeping its types and decorators for esbuild), so the other order works as well.
 * - `filename`:  for error messages, e.g. `Solitaire.compiled.tsx`.
 * - throws esbuild's or Solid's error when `code` isn't valid TSX.
 * - Used by `cli`'s `runCode()`, for a `.tsx`.  NODE-ONLY.
 */
export async function buildTsx(
  code: string,
  { filename = "compiled.tsx" }: { filename?: string } = {}
): Promise<string> {
  const lowered = await transform(code, {
    loader: "tsx",
    jsx: "preserve",
    target: "es2022",
    format: "esm",
    keepNames: true,
    sourcefile: filename
  })
  const drawn = await compileSolidJsx(lowered.code, {
    filename: filename.replace(/\.tsx$/, ".jsx"),
    generate: "dom",
    moduleName: "@solidjs/web"
  })
  return drawn.code
}
