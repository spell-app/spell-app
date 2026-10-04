import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/** A fake checkout and home folder, written once for every test. */
const ROOT = mkdtempSync(join(tmpdir(), "commands-checkout-"))
const HOME = mkdtempSync(join(tmpdir(), "commands-home-"))
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true })
  rmSync(HOME, { recursive: true, force: true })
})

write(ROOT, "package.json", { scripts: { "/////// SECTION": "", ts: "tsc", serve: "node serve.mjs" } })
write(ROOT, "packages/parser/package.json", { scripts: { test: "vitest run" } })
write(ROOT, "packages/ui/site/package.json", { scripts: { dev: "astro dev" } })
write(
  ROOT,
  "packages/cli/src/main.ts",
  'program\n  .command("compile")\nconst dev = program.command("dev")\ndev\n  .command("commands")\n'
)
write(ROOT, ".claude/skills/isolate/SKILL.md", "---\nname: isolate\n---")
write(ROOT, ".claude/skills/solid-2/SKILL.md", "---\nname: solid-2\n---")
write(ROOT, "packages/docs/tools/goals/skills/goals/SKILL.md", "---\nname: goals\n---")
write(HOME, ".claude/skills/session/SKILL.md", "---\nname: session\n---")
write(HOME, ".claude/skills/graphify/SKILL.md", "---\nname: graphify\n---")

describe("commandSources()", () => {
  const names = CLI.commandSources(ROOT, { userSkills: ["session"], ignore: ["/solid-2"] }, HOME).map((it) => it.name)

  test("every command, by surface then name, in the page's name form", () => {
    expect(names).toEqual([
      "spell compile",
      "spell dev",
      "spell dev commands",
      "/goals",
      "/isolate",
      "/session",
      "parser test",
      "root serve",
      "root ts",
      "ui-site dev"
    ])
  })
  test("skips section labels, ignored commands and user skills not asked for", () => {
    expect(names).not.toContain("root /////// SECTION")
    expect(names).not.toContain("/solid-2")
    expect(names).not.toContain("/graphify")
  })
})

describe("pageNames()", () => {
  test("every name in any surface's cell, one or many", () => {
    const names = CLI.pageNames({
      families: [{ rows: [{ cli: { names: "spell compile" }, yarn: { names: ["root ts", "parser test"] } }, {}] }]
    })
    expect([...names].sort()).toEqual(["parser test", "root ts", "spell compile"])
  })
})

/** Write `content` (an object as JSON) to `path` under `root`, making its folders. */
function write(root: string, path: string, content: string | object) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), typeof content === "string" ? content : JSON.stringify(content))
}
