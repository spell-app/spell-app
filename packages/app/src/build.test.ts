import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { describe, test, expect } from "vite-plus/test"

/**
 * Production build smoke test.
 * - Rules defined as classes register under their CLASS NAME (`Rule.instantiate()`), so a minifier which
 *   mangles class names silently breaks every grammar -- and only in production.
 * - `vite.config.ts` sets `output.keepNames` to prevent that;  this fails if someone removes it.
 * - Standard decorators MUST be lowered by `vite.decorators.ts` -- vite's own transformer passes them
 *   through raw, which no browser can run.
 * - `spellCore` MUST be in `spell-runtime.js` alone -- the runtime programs run on -- NOT in the app's chunks.
 * - And `spell-runtime.js` holds no Solid or `@spell-app/ui`:  compiled spell draws with the APP's Solid, from a
 *   shared chunk (epic `output-targets` P10).  Only `@solidjs/h` is its own, a thin layer over that Solid.
 * - No React anywhere:  not in the app's chunks (P9), nor in what programs run on (epic `output-targets` P11).
 * - `ui`'s icon packs beside the chunk holding `BuiltInPacks`, where it looks (`appConfig({ iconPacks })`).
 * - Built with `--sourcemap` (the config writes none):  what a chunk holds comes from its map's `sources`.
 */
describe("production build", () => {
  test("keeps rule class names, lowers decorators, keeps `spellCore` in `spell-runtime.js`, emits icon packs", () => {
    const outDir = mkdtempSync(join(tmpdir(), "spell-build-"))
    try {
      execFileSync(
        "npx",
        ["vite", "build", "--outDir", outDir, "--emptyOutDir", "--sourcemap", "--logLevel", "silent"],
        {
          // the package folder:  a root run has another working directory
          cwd: join(import.meta.dirname, ".."),
          stdio: "pipe"
        }
      )
      const assets = join(outDir, "assets")
      const files = readdirSync(assets).filter((file) => file.endsWith(".js"))
      const chunks = files.map((file) => readFileSync(join(assets, file), "utf8"))
      // the runtime programs run on -- its own entry, holding ALL of `spellCore` (`resetRuntime` is its own);
      // none of the app's chunks may load a second one.  See `spellRuntime.ts`.
      const runtime = readFileSync(join(outDir, "spell-runtime.js"), "utf8")
      expect(runtime).toContain("resetRuntime")
      expect(chunks.filter((chunk) => chunk.includes("resetRuntime"))).toEqual([])
      expect(() => execFileSync("node", ["--check", join(outDir, "spell-runtime.js")], { stdio: "pipe" })).not.toThrow()
      expect(sources(join(outDir, "spell-runtime.js")).filter((source) => SOLID_OR_UI.test(source))).toEqual([])
      const js = [runtime, ...chunks].join("\n")
      // No raw decorator syntax survived (e.g. `@proto static alias = ...`)
      // NOTE: bare `@proto` DOES legitimately appear, in error message strings.
      expect(js).not.toMatch(/@proto\s+static\s+\w+\s*=/)
      // `define_property_has` is a REGISTERED rule, so its class name IS its name in the grammar --
      // that's what `keepNames` protects.
      // - Minified without it, it'd be e.g. `Ab=class extends ...` and the rule would register under a garbage name.
      // - Survives in one of three shapes:  `X = class`, `class X`, or, for a decorated class,
      //   esbuild's `__name(cls, "X")` helper, itself minified to e.g. ``Px(uS,`X`)``.
      const RULE = "define_property_has"
      expect(js).toMatch(
        new RegExp(String.raw`\b${RULE}\s*=\s*class\b|\bclass ${RULE}\b|\(\w+,\s*[\`"']${RULE}[\`"']\)`)
      )
      // no React anywhere:  the app has none (P9), and programs draw with Solid (epic `output-targets` P11)
      const withReact = [...files.map((file) => join(assets, file)), join(outDir, "spell-runtime.js")].filter((file) =>
        sources(file).some((source) => REACT.test(source))
      )
      expect(withReact).toEqual([])
      // icon packs where `BuiltInPacks` looks:  beside its own chunk
      const builtIns = files.filter((file) => sources(join(assets, file)).some((source) => BUILT_IN_PACKS.test(source)))
      expect(builtIns).toHaveLength(1)
      const packs = join(assets, dirname(builtIns[0]!), "icon-packs")
      for (const pack of ["fa7-free", "fa7-brands", "fomantic"]) {
        expect(existsSync(join(packs, pack, "pack.js")), pack).toBe(true)
      }
    } finally {
      rmSync(outDir, { recursive: true, force: true })
    }
  }, 60_000)
})

/** Solid's packages and `@spell-app/ui`, as they appear in a sourcemap's `sources`. */
const SOLID_OR_UI = /\/node_modules\/(solid-js|@solidjs\/(web|signals))\/|\/packages\/ui\/src\//

/** React and what renders with it, as they appear in a sourcemap's `sources`. */
const REACT = /\/node_modules\/(react|react-dom|scheduler|semantic-ui-react)\//

/** `ui`'s `BuiltInPacks`, which looks for the packs beside its own chunk. */
const BUILT_IN_PACKS = /\/packages\/ui\/src\/icons\/BuiltInPacks\.ts$/

/** Source modules javascript file `file` was built from, from its sourcemap;  none for a chunk without one (a facade). */
function sources(file: string): string[] {
  const map = `${file}.map`
  return existsSync(map) ? (JSON.parse(readFileSync(map, "utf8")) as { sources: string[] }).sources : []
}
