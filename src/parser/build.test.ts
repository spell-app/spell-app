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
 */
describe("production build", () => {
  test("keeps rule class names and lowers decorators", () => {
    const outDir = mkdtempSync(join(tmpdir(), "spell-build-"))
    try {
      execFileSync("npx", ["vite", "build", "--outDir", outDir, "--emptyOutDir", "--logLevel", "silent"], {
        stdio: "pipe"
      })
      const assets = join(outDir, "assets")
      const js = readdirSync(assets)
        .filter((file) => file.endsWith(".js"))
        .map((file) => readFileSync(join(assets, file), "utf8"))
        .join("\n")
      // `VariableIdentifier` is a rule class -- mangled, it'd be e.g. `Ab=class extends ...`
      // No raw decorator syntax survived -- e.g. `@proto static alias = ...`
      // NOTE: bare `@proto` DOES legitimately appear, in error message strings.
      expect(js).not.toMatch(/@proto\s+static\s+\w+\s*=/)
      // Name survives in one of three shapes:  `X = class`, `class X`, or for decorated classes
      // esbuild's `__name(cls, "X")` helper call, minified to e.g. `Px(uS,`X`)`.
      expect(js).toMatch(
        /\bVariableIdentifier\s*=\s*class\b|\bclass VariableIdentifier\b|\(\w+,\s*[`"']VariableIdentifier[`"']\)/
      )
    } finally {
      rmSync(outDir, { recursive: true, force: true })
    }
  }, 60_000)
})
