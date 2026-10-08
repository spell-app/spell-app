import { execFileSync } from "child_process"
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI, type Generator } from "$/cli"

/**
 * Throwaway repos:  `src/{a,b}.txt` is the source;  `gen/` its generated output, with a hashed chunk name as a site
 * bundle has;  `packages/p/src/__snapshots__/x.test.ts.snap` a snapshot of both, and of the two together.
 */
const TEMP = realpathSync(mkdtempSync(join(tmpdir(), "merge-main-")))
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

/** Clears `gen/`, then writes `out.txt` (a + b) and `chunk-<length>.txt`. */
const BUILD = `
const fs = require("fs")
const text = fs.readFileSync("src/a.txt", "utf8") + fs.readFileSync("src/b.txt", "utf8")
fs.rmSync("gen", { recursive: true, force: true })
fs.mkdirSync("gen")
fs.writeFileSync("gen/out.txt", text)
fs.writeFileSync("gen/chunk-" + text.length + ".txt", text)
`

/** Writes the snapshot file as Vitest would:  entries `a 1`, `b 1` and `ab 1`, run in `packages/p`. */
const SNAP = `
const fs = require("fs")
const a = fs.readFileSync("../../src/a.txt", "utf8").trim()
const b = fs.readFileSync("../../src/b.txt", "utf8").trim()
const entry = (key, value) => "exports[\`" + key + "\`] = \`\\"" + value + "\\"\`;\\n"
fs.writeFileSync("src/__snapshots__/x.test.ts.snap",
  "// Vitest Snapshot v1\\n\\n" + entry("a 1", a) + "\\n" + entry("ab 1", a + b) + "\\n" + entry("b 1", b))
`

const GENERATORS: Generator[] = [{ name: "gen", outputs: ["gen/**"], cwd: ".", run: ["node", "-e", BUILD] }]
const OPTIONS = { generators: GENERATORS, snapshotUpdate: () => ["node", "-e", SNAP] }

describe("mergeMain()", () => {
  test("generated files changed on both sides are regenerated, orphan chunks go, and a new snapshot is flagged", () => {
    const repo = makeRepo("generated")
    change(repo, "main", { "src/a.txt": "A2\n" })
    change(repo, "wip", { "src/b.txt": "B2\n" })

    const report = CLI.mergeMain(repo, OPTIONS)
    expect(report).toMatchObject({ branch: "wip", result: "merged", conflicts: [], unstaged: [] })
    expect(report.regenerated.map((step) => step.name)).toEqual(["gen", "p snapshots"])
    expect(read(repo, "gen/out.txt")).toBe("A2\nB2\n")
    expect(readdirSync(join(repo, "gen")).sort()).toEqual(["chunk-6.txt", "out.txt"])
    expect(report.review).toEqual([{ file: "packages/p/src/__snapshots__/x.test.ts.snap", keys: ["ab 1"] }])
    expect(git(repo, "log", "-1", "--format=%s")).toBe("Merge main into wip")
    expect(git(repo, "status", "--porcelain")).toBe("")
  })

  test("another file in conflict stops it mid-merge;  `continue` finishes once it's resolved", () => {
    const repo = makeRepo("other")
    change(repo, "main", { "src/a.txt": "main's A\n" })
    change(repo, "wip", { "src/a.txt": "wip's A\n" })

    const stopped = CLI.mergeMain(repo, OPTIONS)
    expect(stopped).toMatchObject({ result: "conflicts", conflicts: ["src/a.txt"], regenerated: [] })
    expect(existsSync(join(repo, ".git", "MERGE_HEAD"))).toBe(true)
    expect(() => CLI.mergeMain(repo, OPTIONS)).toThrow(/a merge is in progress/)

    writeFileSync(join(repo, "src/a.txt"), "both A\n")
    git(repo, "add", "src/a.txt")
    const done = CLI.mergeMain(repo, { ...OPTIONS, mode: "continue" })
    expect(done.result).toBe("merged")
    expect(read(repo, "gen/out.txt")).toBe("both A\nB\n")
    expect(git(repo, "status", "--porcelain")).toBe("")
  })

  test("files the merged `.gitignore` ignores that `main` changed or added leave the index, kept on disk", () => {
    const repo = makeRepo("untracked")
    change(repo, "main", { "built/x.js": "main's build\n", "my.local": "tracked, though ignored\n" })
    git(repo, "merge", "-q", "main")
    // wip stops committing `built/`;  main changes x.js (a modify / delete conflict) and adds y.js
    put(repo, { ".gitignore": "built/\n*.local\n" })
    git(repo, "rm", "-q", "-r", "--cached", "built")
    git(repo, "add", ".gitignore")
    git(repo, "commit", "-q", "-m", "untrack built/")
    change(repo, "main", {
      "built/x.js": "main's newer build\n",
      "built/y.js": "a new chunk\n",
      "my.local": "changed\n"
    })
    put(repo, { "built/x.js": "wip's own build\n" })

    const report = CLI.mergeMain(repo, OPTIONS)
    expect(report).toMatchObject({ result: "merged", conflicts: [], untracked: ["built/x.js", "built/y.js"] })
    expect(git(repo, "ls-files", "built", "my.local")).toBe("my.local")
    expect(existsSync(join(repo, "built/x.js"))).toBe(true)
    expect(git(repo, "status", "--porcelain")).toBe("")
  })

  test("up to date, fast-forward, and refusals", () => {
    const repo = makeRepo("simple")
    expect(CLI.mergeMain(repo, OPTIONS).result).toBe("up-to-date")
    change(repo, "main", { "src/a.txt": "A2\n" })
    expect(CLI.mergeMain(repo, OPTIONS).result).toBe("fast-forward")
    expect(read(repo, "src/a.txt")).toBe("A2\n")

    writeFileSync(join(repo, "src/b.txt"), "dirty\n")
    expect(() => CLI.mergeMain(repo, OPTIONS)).toThrow(/uncommitted changes/)
    expect(() => CLI.mergeMain(repo, { ...OPTIONS, mode: "continue" })).toThrow(/no merge in progress/)
  })
})

describe("generatorsFor()", () => {
  test("the table's generators in order, then one snapshot run per package, with its test files", () => {
    const steps = CLI.generatorsFor([
      "packages/spell/src/rules/__snapshots__/lists.test.ts.snap",
      "packages/docs/tools/_assets/lazy/spell-en.js",
      "packages/ui/src/languages/spell.en.bundle.js",
      "packages/spell/src/__snapshots__/SpellProject.test.ts.snap",
      "packages/ui/src/Thing.ts"
    ])
    expect(steps.map(({ generator, files }) => [generator.name, generator.cwd, files.length])).toEqual([
      ["spell highlighter", "packages/ui", 1],
      ["docs bundle", "packages/docs", 1],
      ["spell snapshots", "packages/spell", 2]
    ])
    expect(steps[2].generator.run).toEqual([
      "yarn",
      "vp",
      "test",
      "run",
      "src/rules/lists.test.ts",
      "src/SpellProject.test.ts",
      "--update"
    ])
  })
})

describe("snapshotEntries()", () => {
  test("each `exports[...]` entry by key, values across lines, escaped backticks kept", () => {
    const text = '// Vitest Snapshot v1\n\nexports[`one 1`] = `\n"x"\n`;\n\nexports[`two \\` 1`] = `"y"`;\n'
    expect([...CLI.snapshotEntries(text)]).toEqual([
      ["one 1", '`\n"x"\n`'],
      ["two \\` 1", '`"y"`']
    ])
  })
})

////////////////
// ## Helpers
////////////////

/** A repo `<name>`:  `main` with the source, its generated output and snapshot;  branch `wip` checked out. */
function makeRepo(name: string): string {
  const repo = join(TEMP, name)
  mkdirSync(repo)
  git(repo, "init", "-q", "-b", "main")
  put(repo, {
    ".gitattributes": "gen/** merge=binary\n**/__snapshots__/*.snap merge=binary\n",
    "src/a.txt": "A\n",
    "src/b.txt": "B\n",
    "packages/p/src/x.test.ts": ""
  })
  regenerate(repo)
  git(repo, "add", "-A")
  git(repo, "commit", "-q", "-m", "first")
  git(repo, "switch", "-q", "-c", "wip")
  return repo
}

/** On `branch`, write `files`, regenerate, commit;  then back to `wip`. */
function change(repo: string, branch: string, files: Record<string, string>) {
  git(repo, "switch", "-q", branch)
  put(repo, files)
  regenerate(repo)
  git(repo, "add", "-A")
  git(repo, "commit", "-q", "-m", `${branch} work`)
  git(repo, "switch", "-q", "wip")
}

/** Run both fake generators, as their owners would before committing. */
function regenerate(repo: string) {
  execFileSync("node", ["-e", BUILD], { cwd: repo })
  mkdirSync(join(repo, "packages/p/src/__snapshots__"), { recursive: true })
  execFileSync("node", ["-e", SNAP], { cwd: join(repo, "packages/p") })
}

function put(repo: string, files: Record<string, string>) {
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, file)), { recursive: true })
    writeFileSync(join(repo, file), text)
  }
}

function read(repo: string, file: string): string {
  return readFileSync(join(repo, file), "utf8")
}

function git(repo: string, ...args: string[]): string {
  return execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd: repo, encoding: "utf8" })
    .toString()
    .trim()
}
