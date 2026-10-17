import { execFileSync } from "child_process"
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { type Generator } from "$/epics/command/command.types"
import { MainMerge } from "$/epics/command/MainMerge"

/**
 * Throwaway repos:
 * - `src/{a,b}.txt`:  the source
 * - `gen/`:  its generated output, with a hashed chunk name as a site bundle has
 * - `packages/p/src/__snapshots__/x.test.ts.snap`:  a snapshot of both, and of the two together
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

describe("MainMerge.run()", () => {
  test("generated files changed on both sides are regenerated, orphan chunks go, and a new snapshot is flagged", () => {
    const repo = makeRepo("generated")
    change(repo, "main", { "src/a.txt": "A2\n" })
    change(repo, "wip", { "src/b.txt": "B2\n" })

    const report = new MainMerge({ root: repo, ...OPTIONS }).run()
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

    const stopped = new MainMerge({ root: repo, ...OPTIONS }).run()
    expect(stopped).toMatchObject({ result: "conflicts", conflicts: ["src/a.txt"], regenerated: [] })
    expect(existsSync(join(repo, ".git", "MERGE_HEAD"))).toBe(true)
    expect(() => new MainMerge({ root: repo, ...OPTIONS }).run()).toThrow(/a merge is in progress/)

    writeFileSync(join(repo, "src/a.txt"), "both A\n")
    git(repo, "add", "src/a.txt")
    const done = new MainMerge({ root: repo, ...OPTIONS }).run("continue")
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

    const report = new MainMerge({ root: repo, ...OPTIONS }).run()
    expect(report).toMatchObject({ result: "merged", conflicts: [], untracked: ["built/x.js", "built/y.js"] })
    expect(git(repo, "ls-files", "built", "my.local")).toBe("my.local")
    expect(existsSync(join(repo, "built/x.js"))).toBe(true)
    expect(git(repo, "status", "--porcelain")).toBe("")
  })

  test("up to date, fast-forward, and refusals", () => {
    const repo = makeRepo("simple")
    expect(new MainMerge({ root: repo, ...OPTIONS }).run().result).toBe("up-to-date")
    change(repo, "main", { "src/a.txt": "A2\n" })
    expect(new MainMerge({ root: repo, ...OPTIONS }).run().result).toBe("fast-forward")
    expect(read(repo, "src/a.txt")).toBe("A2\n")

    writeFileSync(join(repo, "src/b.txt"), "dirty\n")
    expect(() => new MainMerge({ root: repo, ...OPTIONS }).run()).toThrow(/uncommitted changes/)
    expect(() => new MainMerge({ root: repo, ...OPTIONS }).run("continue")).toThrow(/no merge in progress/)
  })
})

/**
 * A repo's list as spell-app's `.epic/generators.json5` starts, in a throwaway checkout:
 * read as the merge reads it
 */
const REPO_GENERATORS = (() => {
  const dir = join(TEMP, "repo-generators")
  mkdirSync(join(dir, ".epic"), { recursive: true })
  const line = (name: string, output: string, cwd: string, run: string[]) =>
    JSON.stringify({ name, outputs: [output], cwd, run })
  writeFileSync(
    join(dir, ".epic/generators.json5"),
    '// in order\n{\n  "generators": [\n' +
      [
        line("yarn.lock", "yarn.lock", ".", ["yarn", "install"]),
        line("spell highlighter", "packages/ui/src/languages/spell.*", "packages/ui", ["yarn", "gen:spell"]),
        line("docs bundle", "packages/epics/tools/_assets/{emoji,lazy}/**", "packages/epics", ["node", "b.js"])
      ].join(",\n") +
      ",\n  ]\n}\n"
  )
  return MainMerge.generatorsOf(dir)
})()

describe("generatorsOf()", () => {
  test("a checkout's `.epic/generators.json5`, in order;  none without one;  a bad entry named", () => {
    expect(REPO_GENERATORS.slice(0, 2).map((generator) => generator.name)).toEqual(["yarn.lock", "spell highlighter"])
    const dir = join(TEMP, "generators-of")
    mkdirSync(join(dir, ".epic"), { recursive: true })
    expect(MainMerge.generatorsOf(dir)).toEqual([])
    writeFileSync(
      join(dir, ".epic/generators.json5"),
      '// a comment\n{ "generators": [{ "name": "gen", "outputs": ["gen/**"], "cwd": ".", "run": ["node", "x.js"] },] }\n'
    )
    expect(MainMerge.generatorsOf(dir)).toEqual(GENERATORS.map((g) => ({ ...g, run: ["node", "x.js"] })))
    writeFileSync(join(dir, ".epic/generators.json5"), '{ "generators": [{ "name": "gen" }] }')
    expect(() => MainMerge.generatorsOf(dir)).toThrow(/generator 1 must be/)
  })
})

describe("generatorsFor()", () => {
  test("the list's generators in order, then one snapshot run per package, with its test files", () => {
    const steps = MainMerge.generatorsFor(
      [
        "packages/spell/src/rules/__snapshots__/lists.test.ts.snap",
        "packages/epics/tools/_assets/lazy/spell-en.js",
        "packages/ui/src/languages/spell.en.bundle.js",
        "packages/spell/src/__snapshots__/SpellProject.test.ts.snap",
        "packages/ui/src/Thing.ts"
      ],
      REPO_GENERATORS
    )
    expect(steps.map(({ generator, files }) => [generator.name, generator.cwd, files.length])).toEqual([
      ["spell highlighter", "packages/ui", 1],
      ["docs bundle", "packages/epics", 1],
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

  test("a snapshot under tests/<package>/ is that package's:  run in packages/<package>, its test found from there", () => {
    const steps = MainMerge.generatorsFor(
      [
        "tests/spell/src/rules/lists/__snapshots__/lists.test.ts.snap",
        "tests/core/src/__snapshots__/json.test.ts.snap"
      ],
      REPO_GENERATORS
    )
    expect(steps.map(({ generator }) => [generator.name, generator.cwd, generator.run])).toEqual([
      [
        "spell snapshots",
        "packages/spell",
        ["yarn", "vp", "test", "run", "../../tests/spell/src/rules/lists/lists.test.ts", "--update"]
      ],
      [
        "core snapshots",
        "packages/core",
        ["yarn", "vp", "test", "run", "../../tests/core/src/json.test.ts", "--update"]
      ]
    ])
  })
})

describe("snapshotEntries()", () => {
  test("each `exports[...]` entry by key, values across lines, escaped backticks kept", () => {
    const text = '// Vitest Snapshot v1\n\nexports[`one 1`] = `\n"x"\n`;\n\nexports[`two \\` 1`] = `"y"`;\n'
    expect([...MainMerge.snapshotEntries(text)]).toEqual([
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
