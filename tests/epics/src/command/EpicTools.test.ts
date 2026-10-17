import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { EpicTools } from "$/epics/command/EpicTools"

/**
 * Two fake checkouts:
 * - CODE:  the running `epic`'s, its tools fake scripts that report what they got
 * - DATA:  the caller's, where the command runs from, with the same files
 * - ONE copy of the code (epic `epic-eject` P5):  every epic tool must be CODE's script, working on DATA.
 */
const TEMP = realpathSync(mkdtempSync(join(tmpdir(), "epic-tools-")))
const CODE = join(TEMP, "code")
const DATA = join(TEMP, "data")
/** A folder inside the caller's checkout, to run from. */
const INSIDE = join(DATA, "packages", "app")
/** Where each run's report goes. */
const REPORT = join(TEMP, "report.json")
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

const SCRIPT = (
  owner: string
) => `process.getBuiltinModule("node:fs").writeFileSync(process.env.REPORT, JSON.stringify({
  owner: ${JSON.stringify(owner)}, args: process.argv.slice(2), cwd: process.cwd(),
  checkout: process.env.EPIC_CHECKOUT, tsconfig: process.env.TSX_TSCONFIG_PATH
}))
process.exit(3)
`
for (const [root, owner] of [
  [CODE, "code"],
  [DATA, "data"]
] as const) {
  for (const { tool } of Object.values(EpicTools.TOOLS)) {
    mkdirSync(join(root, tool, ".."), { recursive: true })
    // plain node runs the `.ts` ones too (no types in them):  `tsx` is the loader, given by path
    writeFileSync(join(root, tool), SCRIPT(owner))
  }
  writeFileSync(join(root, "packages/epics/tsconfig.json"), "{}")
  writeFileSync(join(root, "packages/server/tsconfig.json"), "{}")
}
mkdirSync(INSIDE, { recursive: true })

/** Run tool `name` from `INSIDE` with CODE as the code:  its exit code, and what the fake tool reported. */
async function run(name: Parameters<typeof EpicTools.run>[0], args: string[]) {
  rmSync(REPORT, { force: true })
  const status = await EpicTools.run(name, args, { cwd: INSIDE, codeRoot: CODE, env: { REPORT } })
  return { status, ...JSON.parse(readFileSync(REPORT, "utf8")) }
}

describe("EpicTools.run()", () => {
  test("window:  the running epic's script, args verbatim, in the caller's folder;  the caller's checkout is the data", async () => {
    const window = await run("window", ["open", "x", "--all", "--json"])
    expect(window).toMatchObject({ status: 3, owner: "code", args: ["open", "x", "--all", "--json"], checkout: DATA })
    expect(realpathSync(window.cwd)).toBe(INSIDE)
    expect(window.tsconfig).toBeUndefined()
  })

  test("details, choices:  in the caller's packages/epics, as yarn ran them", async () => {
    for (const name of ["details", "choices"] as const) {
      const tool = await run(name, ["list", "seo"])
      expect(tool).toMatchObject({ status: 3, owner: "code", args: ["list", "seo"], checkout: DATA })
      expect(realpathSync(tool.cwd)).toBe(join(DATA, "packages/epics"))
    }
  })

  test("notes, comments, agents, airplane:  under tsx with the CODE's config, in the caller's folder", async () => {
    for (const name of ["notes", "comments", "agents", "airplane"] as const) {
      const tool = await run(name, ["answer", "guides/x.html#n3", "--file", "reply.html"])
      expect(tool).toMatchObject({ status: 3, owner: "code", checkout: DATA })
      expect(tool.args).toEqual(["answer", "guides/x.html#n3", "--file", "reply.html"])
      expect(realpathSync(tool.cwd)).toBe(INSIDE)
      expect(tool.tsconfig).toBe(join(CODE, "packages/epics/tsconfig.json"))
    }
  })

  test("server, serve:  the CALLER's copy, the page server serving its own checkout", async () => {
    const server = await run("server", ["status"])
    expect(server).toMatchObject({ status: 3, owner: "data", args: ["status"] })
    expect(server.tsconfig).toBe(join(DATA, "packages/server/tsconfig.json"))
    expect(await run("serve", [])).toMatchObject({ owner: "data" })
  })
})

describe("EpicTools.toolArgs()", () => {
  test("plain node:  just the script;  tsx:  this checkout's loader first", () => {
    expect(EpicTools.toolArgs(EpicTools.TOOLS.window, "/wt")).toEqual(["/wt/scripts/window.mjs"])
    expect(EpicTools.toolArgs(EpicTools.TOOLS.notes, "/wt")).toEqual([
      "--import",
      EpicTools.TSX_LOADER,
      "/wt/packages/epics/tools/notes.ts"
    ])
  })
})
