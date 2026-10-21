import { existsSync, readFileSync } from "fs"
import { dirname, join, relative, resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

/** This package's `src/`, where `$/cli/...` points. */
const SRC = resolve(import.meta.dirname, "../../../cli/src")

/**
 * Packages whose loading means spell is loaded:  the language and what it stands on.
 * - not the kit's element tools (`spell-kit/element/tools/...`):  node tools `spell dev pack` imports, which
 *   `devProgram.ts` brings along
 */
const SPELL_PACKAGES = /^\$\/(spell|lsp|parser|core)(\/|$)/

describe("devMain.ts", () => {
  test("starts LEAN:  nothing it imports up front reaches the $/cli barrel, main.ts or spell", () => {
    const { files, packages } = staticImports(join(SRC, "devMain.ts"))
    const names = files.map((file) => relative(SRC, file))
    expect(names).toContain("devProgram.ts")
    expect(names).not.toContain("index.ts")
    expect(names).not.toContain("main.ts")
    expect(packages.filter((name) => SPELL_PACKAGES.test(name))).toEqual([])
  })

  // epic `epic-eject` I5:  the epic verbs' old spellings hand on to `epic`, spell-epic's command
  test("never imports the epic engine:  its old spellings run `epic`, so a checkout without spell-epic still compiles", () => {
    const { packages } = staticImports(join(SRC, "devMain.ts"))
    expect(packages.filter((name) => name.startsWith("$/epics"))).toEqual([])
  })
})

/**
 * What `entry` loads up front, followed file by file:
 * - `files`:  every file of ours it loads by static `import` (and `export ... from`)
 * - `packages`:  the other packages' specifiers those files name
 * - ours:  `$/cli/...` and relative imports
 * - `import type` and dynamic `import()` aren't followed:
 *   the first loads nothing, the second only when a command needs it (`main.ts`, for the barrel's commands)
 */
function staticImports(entry: string): { files: string[]; packages: string[] } {
  const files = new Set<string>()
  const packages = new Set<string>()
  const visit = (file: string) => {
    if (files.has(file)) return
    files.add(file)
    const source = readFileSync(file, "utf8")
    for (const [, specifier] of source.matchAll(STATIC_IMPORT)) {
      // an import line inside a template the file writes out, not one of its own
      if (specifier!.includes("${")) continue
      const local = specifier!.startsWith("$/cli/") ? specifier!.replace(/^\$\/cli/, SRC) : null
      const path = local ?? (specifier!.startsWith(".") ? resolve(dirname(file), specifier!) : null)
      if (path && sourceFile(path)) visit(sourceFile(path)!)
      else if (!path) packages.add(specifier!)
    }
  }
  visit(entry)
  return { files: [...files], packages: [...packages] }
}

/**
 * The `.ts` / `.tsx` file an import of `path` means:  itself, or its folder's `index.ts`.
 * - `undefined` for a plain script, which isn't followed
 * - throws if nothing is there
 */
function sourceFile(path: string): string | undefined {
  for (const each of [path, `${path}.ts`, `${path}.tsx`, join(path, "index.ts")])
    if (existsSync(each) && each.match(/\.tsx?$/)) return each
  if (existsSync(path)) return undefined
  throw new Error(`no source for ${path}`)
}

/** A static value import or re-export:  `import { x } from "y"`, `import "y"`, `export * from "y"`;  not `import type`. */
const STATIC_IMPORT = /^(?:import(?!\s+type\b)(?:[^"';]*?\bfrom)?|export\s[^"';]*?\bfrom)\s*"([^"]+)"/gm
