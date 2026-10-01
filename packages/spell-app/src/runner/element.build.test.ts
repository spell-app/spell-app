import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, test, expect } from "vitest"


/**
 * Production builds of the runners:  `<spell-app>` (`yarn build:element`) and the VS Code runner (`yarn build:runner`)
 * -- and `<spell-editor>`, which `yarn build:element` builds beside `<spell-app>`.
 * - `spellCore` MUST be in `spell-runtime.js` ALONE:  each runner loads its own copy of that file, for a
 *   `spellCore` of its own.  In a shared chunk, every app on a page would share one -- one runtime, one console
 *   -- and a runner would show a `spellCore` its program doesn't run on.  So nothing a runner itself imports may
 *   import `spellCore`.
 * - Every bundle MUST parse:  a build can succeed and still write javascript no browser runs -- e.g. vite's
 *   module preloading once moved an `await` into a non-`async` arrow.  See `PAPERCUTS.md`.
 */
describe("runner builds", () => {
  test("<spell-app>:  `spellCore` only in `spell-runtime.js`, every bundle parses, the built-ins' pack beside it", () => {
    const outDir = mkdtempSync(join(tmpdir(), "spell-element-"))
    try {
      build("vite.element.config.ts", outDir)
      const js = readdirSync(outDir).filter((file) => file.endsWith(".js"))
      expect(js).toEqual(expect.arrayContaining(["spell-app.js", "spell-runtime.js", "spell-shared.js"]))
      // `resetRuntime` is `spellCore`'s own -- see `spellCore/runtime.ts`
      const withCore = js.filter((file) => readFileSync(join(outDir, file), "utf8").includes("resetRuntime"))
      expect(withCore).toEqual(["spell-runtime.js"])
      for (const file of js) expectParses(join(outDir, file))
      expect(existsSync(join(outDir, "spell-app.css"))).toBe(true)
      expect(readFileSync(join(outDir, "spell-app.css"), "utf8")).not.toContain(".monaco-editor")
      expect(existsSync(join(outDir, "semantic-ui-css", "semantic.min.css"))).toBe(true)
    } finally {
      rmSync(outDir, { recursive: true, force: true })
    }
  }, 120_000)

  test("<spell-editor>:  no `spellCore`, Monaco loaded lazily, every bundle parses, its own CSS", () => {
    const outDir = mkdtempSync(join(tmpdir(), "spell-editor-"))
    try {
      build("vite.editor.config.ts", outDir)
      const js = readdirSync(outDir).filter((file) => file.endsWith(".js"))
      expect(js).toEqual(
        expect.arrayContaining(["spell-editor.js", "spell-editor-monaco.js", "spell-editor-editor.worker.js"])
      )
      // apps run on their own copy of the runtime -- see `spellRuntime.ts`
      const withCore = js.filter((file) => readFileSync(join(outDir, file), "utf8").includes("resetRuntime"))
      expect(withCore).toEqual([])
      // Monaco only through `import()`, NOT a static import:  the parser compiles, and apps run, before it loads
      const entry = readFileSync(join(outDir, "spell-editor.js"), "utf8")
      expect(entry).toMatch(/import\(`\.\/spell-editor-monaco\.js`\)/)
      expect(entry).not.toMatch(/from\s*["'`]\.\/spell-editor-monaco\.js/)
      for (const file of js) expectParses(join(outDir, file))
      // Monaco's CSS, in the editor's own file -- NOT `spell-app.css`, which every `<spell-app>` adopts
      expect(readFileSync(join(outDir, "spell-editor.css"), "utf8")).toContain(".monaco-editor")
    } finally {
      rmSync(outDir, { recursive: true, force: true })
    }
  }, 120_000)

  test("VS Code runner:  `spellCore` only in `spell-runtime.js`, every bundle parses", () => {
    const outDir = mkdtempSync(join(tmpdir(), "spell-runner-"))
    try {
      build("vite.runner.config.ts", outDir)
      const js = readdirSync(outDir).filter((file) => file.endsWith(".js"))
      expect(js).toEqual(expect.arrayContaining(["runner.js", "spell-runtime.js", "spell-shared.js"]))
      const withCore = js.filter((file) => readFileSync(join(outDir, file), "utf8").includes("resetRuntime"))
      expect(withCore).toEqual(["spell-runtime.js"])
      for (const file of js) expectParses(join(outDir, file))
      expect(existsSync(join(outDir, "runner.css"))).toBe(true)
    } finally {
      rmSync(outDir, { recursive: true, force: true })
    }
  }, 120_000)
})

/** Build with vite config `config` into `outDir`. */
function build(config: string, outDir: string) {
  execFileSync("npx", ["vite", "build", "-c", config, "--outDir", outDir, "--emptyOutDir", "--logLevel", "silent"], {
    // the package folder:  a root run has another working directory
    cwd: join(import.meta.dirname, "..", ".."),
    stdio: "pipe"
  })
}

/** Fail unless javascript module `path` parses -- `node --check`, which throws on a syntax error. */
function expectParses(path: string) {
  expect(() => execFileSync("node", ["--check", path], { stdio: "pipe" }), path).not.toThrow()
}
