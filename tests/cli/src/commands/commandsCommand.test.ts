import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, describe, expect, test, vi } from "vite-plus/test"

import { CLI } from "$/cli"

/** A fake checkout and home folder, written once for every test. */
const ROOT = mkdtempSync(join(tmpdir(), "commands-checkout-"))
const HOME = mkdtempSync(join(tmpdir(), "commands-home-"))
afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true })
  rmSync(HOME, { recursive: true, force: true })
})

// what marks a checkout (`CLI.findCheckout()`)
write(ROOT, "tsconfig.base.json", "{}")
write(ROOT, "package.json", { scripts: { "/////// SECTION": "", ts: "tsc", serve: "node serve.mjs" } })
write(ROOT, "packages/parser/package.json", { scripts: { test: "vitest run" } })
write(ROOT, "packages/ui/site/package.json", { scripts: { dev: "astro dev" } })
write(ROOT, "packages/cli/src/main.ts", 'program\n  .command("compile")\nprogram\n  .command("plan-doc")\n')
write(ROOT, "packages/cli/src/devProgram.ts", 'const dev = program\n  .command("dev")\ndev\n  .command("commands")\n')
// the `epic` command's verbs and the plugin's skills:  spell-epic's, through the checkout's link (epic `epic-eject` I5)
write(ROOT, "spell-epic/src/command/EpicProgram.ts", 'epic\n  .command("send")\npage(epic.command("close"), "close")\n')
write(ROOT, "spell-epic/skills/epic/SKILL.md", "---\nname: epic\n---")
write(ROOT, ".claude/skills/isolate/SKILL.md", "---\nname: isolate\n---")
write(ROOT, ".claude/skills/solid-2/SKILL.md", "---\nname: solid-2\n---")
write(HOME, ".claude/skills/session/SKILL.md", "---\nname: session\n---")
write(HOME, ".claude/skills/graphify/SKILL.md", "---\nname: graphify\n---")

describe("commandSources()", () => {
  const names = CLI.commandSources(ROOT, { userSkills: ["session"], ignore: ["/solid-2"] }, HOME).map((it) => it.name)

  test("every command, by surface then name, in the page's name form", () => {
    expect(names).toEqual([
      "epic close",
      "epic send",
      "spell compile",
      "spell dev",
      "spell dev commands",
      "spell plan-doc",
      "/epic",
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

describe("the commands page's data (epic `epic-workflow` P21)", () => {
  /** `spell dev commands list --json` in checkout `ROOT`:  what it printed, parsed. */
  async function listed(): Promise<{ commands: { name: string; named: boolean }[] }> {
    const printed: string[] = []
    const out = vi.spyOn(CLI.CliSession.prototype, "out").mockImplementation((text) => void printed.push(text))
    const cwd = process.cwd()
    process.chdir(ROOT)
    try {
      expect(await CLI.commandsCommand(new CLI.CliSession(), ["list"], { json: true } as CLI.CommandsOptions)).toBe(0)
    } finally {
      process.chdir(cwd)
      out.mockRestore()
    }
    return JSON.parse(printed.join(""))
  }

  test("its old commands.json still read;  commands.json5 first, comments and all", async () => {
    const page = { families: [{ rows: [{ cli: { names: "spell compile" } }] }] }
    write(ROOT, "guides/dev/commands/commands.json", page)
    expect((await listed()).commands.find((it) => it.name === "spell compile")?.named).toBe(true)
    write(ROOT, "guides/dev/commands/commands.json5", `// Owen:  the rows\n${JSON.stringify({ families: [] })}`)
    expect((await listed()).commands.find((it) => it.name === "spell compile")?.named).toBe(false)
  })

  // epic `epic-eject` P12:  no `guides` link at the checkout's root
  test("read from the shared content folder, not the checkout", async () => {
    const content = mkdtempSync(join(tmpdir(), "commands-content-"))
    const page = { families: [{ rows: [{ cli: { names: "spell compile" } }] }] }
    write(content, "guides/dev/commands/commands.json5", page)
    vi.stubEnv("SPELL_SHARED_DIR", content)
    try {
      expect((await listed()).commands.find((it) => it.name === "spell compile")?.named).toBe(true)
    } finally {
      vi.unstubAllEnvs()
      rmSync(content, { recursive: true, force: true })
    }
  })
})

/** Write `content` (an object as JSON) to `path` under `root`, making its folders. */
function write(root: string, path: string, content: string | object) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), typeof content === "string" ? content : JSON.stringify(content))
}
