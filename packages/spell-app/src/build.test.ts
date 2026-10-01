import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, test, expect } from "vitest"


/**
 * Production build smoke test.
 * - Rules defined as classes register under their CLASS NAME (`Rule.instantiate()`), so a minifier which
 *   mangles class names silently breaks every grammar -- and only in production.
 * - `vite.config.ts` sets `output.keepNames` to prevent that;  this fails if someone removes it.
 * - Standard decorators MUST be lowered by `vite.decorators.ts` -- vite's own transformer passes them
 *   through raw, which no browser can run.
 * - `spellCore` MUST be in `spell-runtime.js` alone -- the runtime programs run on -- NOT in the app's chunks.
 */
describe("production build", () => {
  test("keeps rule class names, lowers decorators, and keeps `spellCore` in `spell-runtime.js`", () => {
    const outDir = mkdtempSync(join(tmpdir(), "spell-build-"))
    try {
      execFileSync("npx", ["vite", "build", "--outDir", outDir, "--emptyOutDir", "--logLevel", "silent"], {
        // the package folder:  a root run has another working directory
        cwd: join(import.meta.dirname, ".."),
        stdio: "pipe"
      })
      const assets = join(outDir, "assets")
      const chunks = readdirSync(assets)
        .filter((file) => file.endsWith(".js"))
        .map((file) => readFileSync(join(assets, file), "utf8"))
      // the runtime programs run on -- its own entry, holding ALL of `spellCore` (`resetRuntime` is its own);
      // none of the app's chunks may load a second one.  See `spellRuntime.ts`.
      const runtime = readFileSync(join(outDir, "spell-runtime.js"), "utf8")
      expect(runtime).toContain("resetRuntime")
      expect(chunks.filter((chunk) => chunk.includes("resetRuntime"))).toEqual([])
      expect(() => execFileSync("node", ["--check", join(outDir, "spell-runtime.js")], { stdio: "pipe" })).not.toThrow()
      const js = [runtime, ...chunks].join("\n")
      // No raw decorator syntax survived -- e.g. `@proto static alias = ...`
      // NOTE: bare `@proto` DOES legitimately appear, in error message strings.
      expect(js).not.toMatch(/@proto\s+static\s+\w+\s*=/)
      // `define_property_has` is a REGISTERED rule, so its class name IS its name in the grammar -- that's
      // what `keepNames` protects.  Minified without it, it'd be e.g. `Ab=class extends ...` and the rule
      // would register under a garbage name.
      // Survives in one of three shapes:  `X = class`, `class X`, or, for a decorated class, esbuild's
      // `__name(cls, "X")` helper, itself minified to e.g. ``Px(uS,`X`)``.
      const RULE = "define_property_has"
      expect(js).toMatch(
        new RegExp(String.raw`\b${RULE}\s*=\s*class\b|\bclass ${RULE}\b|\(\w+,\s*[\`"']${RULE}[\`"']\)`)
      )
    } finally {
      rmSync(outDir, { recursive: true, force: true })
    }
  }, 60_000)
})
