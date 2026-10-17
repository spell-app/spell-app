import { existsSync, readFileSync } from "fs"
import { dirname, join, relative, resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

/** This package's `src/`, where `$/cli/...` points. */
const SRC = resolve(import.meta.dirname, "../../../packages/cli/src")

/** The epics package's `src/`, where `$/epics/...` points:  the epic command's code (epic `epic-eject` P5). */
const EPICS = resolve(import.meta.dirname, "../../../packages/epics/src")

/**
 * Packages whose loading means spell is loaded:  the language and what it stands on.
 * - not `$/ui/tools/...`:  node tools `spell dev pack` imports, which `devProgram.ts` brings along
 */
const SPELL_PACKAGES = /^\$\/(spell|lsp|parser|core)(\/|$)/

describe("epicMain.ts", () => {
  test("starts LEAN:  nothing it imports up front reaches the $/cli barrel, main.ts or spell", () => {
    const { files, packages } = staticImports(join(SRC, "epicMain.ts"))
    const cli = files.filter((file) => file.startsWith(SRC)).map((file) => relative(SRC, file))
    const epics = files.filter((file) => file.startsWith(EPICS)).map((file) => relative(EPICS, file))
    // the command is the epic code's:  the CLI gives only its entry
    expect(cli).toEqual(["epicMain.ts"])
    expect(epics).toContain(join("command", "EpicProgram.ts"))
    expect(epics).toContain(join("command", "epicArgs.ts"))
    expect(epics).toContain(join("command", "Sessions.ts"))
    // NEVER the epic tool up front (linkedom, oxfmt):  only once a page verb runs
    expect(epics).not.toContain(join("tool", "PlanDocCommands.ts"))
    expect(packages.filter((name) => name.startsWith("$/cli"))).toEqual([])
    expect(packages.filter((name) => SPELL_PACKAGES.test(name))).toEqual([])
  })
})

describe("devProgram.ts", () => {
  test("its aliases of the epic verbs reach the epic code, never the $/cli barrel or spell", () => {
    const { files, packages } = staticImports(join(SRC, "devProgram.ts"))
    const names = files.filter((file) => file.startsWith(SRC)).map((file) => relative(SRC, file))
    expect(names).not.toContain("index.ts")
    expect(names).not.toContain("main.ts")
    expect(files.map((file) => relative(EPICS, file))).toContain(join("command", "Worktrees.ts"))
    expect(packages.filter((name) => SPELL_PACKAGES.test(name))).toEqual([])
  })
})

/**
 * Every file of ours `entry` loads by static `import` (and `export ... from`), followed;  and the other packages'
 * specifiers it names.
 * - ours:  `$/cli/...`, `$/epics/...` (the epic command) and relative imports
 * - `import type` and dynamic `import()` aren't followed:  the first loads nothing, the second only when a verb
 *   needs it (the `epic` tool)
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
      const local = specifier!.startsWith("$/cli/")
        ? specifier!.replace(/^\$\/cli/, SRC)
        : specifier!.startsWith("$/epics/")
          ? specifier!.replace(/^\$\/epics/, EPICS)
          : null
      const path = local ?? (specifier!.startsWith(".") ? resolve(dirname(file), specifier!) : null)
      if (path && sourceFile(path)) visit(sourceFile(path)!)
      else if (!path) packages.add(specifier!)
    }
  }
  visit(entry)
  return { files: [...files], packages: [...packages] }
}

/**
 * The `.ts` / `.tsx` file an import of `path` means:  itself, or its folder's `index.ts`;  `undefined` for a plain
 * script (`window.mjs`, a docs tool's `.js`), which isn't followed.
 */
function sourceFile(path: string): string | undefined {
  for (const each of [path, `${path}.ts`, `${path}.tsx`, join(path, "index.ts")])
    if (existsSync(each) && each.match(/\.tsx?$/)) return each
  if (existsSync(path)) return undefined
  throw new Error(`no source for ${path}`)
}

/** A static value import or re-export:  `import { x } from "y"`, `import "y"`, `export * from "y"`;  not `import type`. */
const STATIC_IMPORT = /^(?:import(?!\s+type\b)(?:[^"';]*?\bfrom)?|export\s[^"';]*?\bfrom)\s*"([^"]+)"/gm
