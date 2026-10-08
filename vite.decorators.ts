import { transform } from "esbuild"
import type { Plugin } from "vite"

/**
 * Lower standard (TC39 "stage 3", 2023-11) decorators with esbuild BEFORE vite's own transform sees them.
 * - Vite 8 transforms TS with oxc, which only lowers LEGACY decorators (oxc-project/oxc#9170), and neither
 *   node nor browsers run decorators natively -- without this, decorated files die with a bare `SyntaxError`.
 * - Only touches files which actually contain a decorator;  everything else stays on vite's normal path.
 * - esbuild rather than SWC / babel:  `tsx` already runs the server through esbuild, so client, server
 *   and tests all lower decorators identically.  One small, fast dependency, so `@proto` behaves
 *   identically across `spell/parser`, `@spell-app/ui`, and runners built with this plugin.
 * - `keepNames` MUST stay on:  rule classes register under their class name (see `packages/spell/src/parser/build.test.ts`),
 *   and custom element classes keep their class names (`UIButton`), which the custom-elements manifest and
 *   dev-time warnings read -- the build keeps them too.
 * - JSX is preserved (loader `tsx`) for vite's react / Solid plugin to deal with;  the Solid plugin runs next.
 * - esbuild's transform has no "import helpers" option:  every file gets its own copy of the decorator runtime
 *   (`__decorateElement`, `__runInitializers` ... ~2.6 kB minified).  So the copy is swapped for an import of ONE
 *   shared module, `HELPERS_MODULE` (made from `HELPERS_PROBE`'s output), when every helper the file declares is
 *   that module's, word for word;  else the file keeps its own (`@spell-app/ui`'s core had 12 copies, epic
 *   `wwod-spell-ui` I26).  The swap keeps the line count, so esbuild's source map still lines up.
 * - MUST be used by BOTH `vite.config.ts` and `vitest.config.ts` in every package (`@spell-app/ui`'s site bundle,
 *   `vite.site.config.ts`, gets it through `baseConfig()`).
 * - TODO: delete this file when oxc lowers standard decorators.
 */
export function standardDecorators(): Plugin {
  return {
    name: "standard-decorators-via-esbuild",
    enforce: "pre",
    resolveId(id) {
      return id === HELPERS_MODULE ? HELPERS_ID : undefined
    },
    async load(id) {
      if (id !== HELPERS_ID) return undefined
      const { helpers } = await sharedHelpers()
      return `${[...helpers.values()].join("\n")}\nexport { ${[...helpers.keys()].join(", ")} }\n`
    },
    async transform(code, id) {
      const [file] = id.split("?", 1)
      if (!file || !SCRIPT_FILE.test(file) || file.includes("/node_modules/") || !DECORATOR.test(code)) return
      const result = await transform(code, {
        loader: file.endsWith("x") ? "tsx" : "ts",
        jsx: "preserve",
        target: "es2022",
        format: "esm",
        keepNames: true,
        sourcefile: file,
        sourcemap: true
      })
      return { code: await withSharedHelpers(result.code), map: result.map }
    }
  }
}

/** Files we'll consider. */
const SCRIPT_FILE = /\.[cm]?tsx?$/

/**
 * Cheap test for "line starts with a decorator" -- false positives just cost one extra transform.
 * - NOTE: decorators MUST start their line (after indentation), so `@foo class ...` or `@foo static x`
 *   mid-line won't be noticed.  oxfmt lays them out this way anyway.
 */
const DECORATOR = /^\s*@[A-Za-z_$][\w$.]*/m

/** What a file imports the shared decorator runtime from. */
const HELPERS_MODULE = "virtual:esbuild-decorator-helpers"

/** `HELPERS_MODULE`'s resolved id:  `\0`, so no other plugin touches it. */
const HELPERS_ID = "\0esbuild-decorator-helpers"

/**
 * A class using every kind of decorator esbuild lowers (static / instance, public / private, accessor, method,
 * getter, setter, field), so its output declares every helper a file may need.
 */
const HELPERS_PROBE = `const d = (...a) => undefined
@d class A {
  @d static accessor sa = 1
  @d accessor a = 1
  @d static accessor #spa = 1
  @d accessor #pa = 1
  @d static #sp = 1
  @d #p = 1
  @d static sm() {}
  @d m() {}
  @d static #spm() {}
  @d #pm() {}
  @d get g() { return 1 }
  @d set g(v) {}
  @d static get sg() { return 1 }
  @d get #pg() { return 1 }
  @d set #pg(v) {}
  @d f = 1
  @d static sf = 1
}
export { A }`

/** `HELPERS_PROBE`'s helpers, by name, each as esbuild writes it;  made once. */
let shared: Promise<{ helpers: Map<string, string> }> | undefined

/** The shared helpers (see `shared`). */
function sharedHelpers(): Promise<{ helpers: Map<string, string> }> {
  return (shared ??= transform(HELPERS_PROBE, { loader: "ts", target: "es2022", format: "esm", keepNames: true }).then(
    ({ code }) => ({ helpers: preambleOf(code).helpers })
  ))
}

/** `code` with its helper preamble swapped for an import of `HELPERS_MODULE`, when every helper matches (see above). */
async function withSharedHelpers(code: string): Promise<string> {
  const { helpers, lineCount } = preambleOf(code)
  if (!helpers.size) return code
  const all = (await sharedHelpers()).helpers
  for (const [name, text] of helpers) if (all.get(name) !== text) return code
  const lines = code.split("\n")
  const imports = `import { ${[...helpers.keys()].join(", ")} } from "${HELPERS_MODULE}";`
  return [imports, ...Array<string>(lineCount - 1).fill(""), ...lines.slice(lineCount)].join("\n")
}

/**
 * The helper declarations esbuild puts at the top of its output (`var __name = ...`, with their continuation
 * lines), by name, and how many lines they take.
 */
function preambleOf(code: string): { helpers: Map<string, string>; lineCount: number } {
  const lines = code.split("\n")
  const helpers = new Map<string, string>()
  let name: string | undefined
  let lineCount = 0
  for (const line of lines) {
    const start = HELPER_START.exec(line)
    if (start) name = start[1]!
    else if (!name || !HELPER_CONTINUATION.test(line)) break
    helpers.set(name!, helpers.has(name!) && !start ? `${helpers.get(name!)}\n${line}` : line)
    lineCount++
  }
  return { helpers, lineCount }
}

/** First line of a helper:  `var __name = ...`. */
const HELPER_START = /^var (__\w+) = /

/** A helper's later lines:  indented, or its closing `};` / `}`. */
const HELPER_CONTINUATION = /^(?: |\};?$|\}\)?;?$)/
