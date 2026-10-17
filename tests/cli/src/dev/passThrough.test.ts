import { describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"
import { rawArgs } from "$/cli/devProgram"

describe("vscodeSteps()", () => {
  test("build, install, or both, as root yarn's vscode:build / vscode:install / vscode did", () => {
    expect(CLI.vscodeSteps("build")).toEqual([["install"], ["build"], ["package"]])
    expect(CLI.vscodeSteps("install")).toEqual([["install-extension"]])
    expect(CLI.vscodeSteps()).toEqual([["install"], ["build"], ["package"], ["install-extension"]])
  })
  test("any other verb is a usage error", () => {
    expect(() => CLI.vscodeSteps("check")).toThrow(/unknown verb 'check'/)
  })
})

describe("behindMainError()", () => {
  test("main, or a branch with all of main in it, may build;  one BEHIND main is refused, saying how to fix it", () => {
    expect(CLI.behindMainError("main", 0, "main")).toBeUndefined()
    expect(CLI.behindMainError("main", 3, "main")).toBeUndefined()
    expect(CLI.behindMainError("epic-eject", 0, "main")).toBeUndefined()
    expect(CLI.behindMainError("epic-eject", 51, "main")).toBe(
      "epic-eject is 51 commits behind main:  building the extension from it would downgrade every window.  " +
        "Merge main first (`spell dev worktree merge-main`), or pass --force."
    )
    expect(CLI.behindMainError("x", 1, "main")).toMatch(/^x is 1 commit behind main:/)
  })

  test("the base branch is the repo's (`.epic/config.json5`), not always main", () => {
    expect(CLI.behindMainError("trunk", 4, "trunk")).toBeUndefined()
    expect(CLI.behindMainError("main", 2, "trunk")).toMatch(/^main is 2 commits behind trunk:.*Merge trunk first/)
  })
})

describe("toolArgs()", () => {
  test("plain node:  just the script, in the tool's checkout", () => {
    expect(CLI.toolArgs(CLI.TOOLS.window, "/wt")).toEqual(["/wt/scripts/window.mjs"])
  })
  test("tsx:  the CLI checkout's loader first", () => {
    expect(CLI.toolArgs(CLI.TOOLS["docs link"], "/wt")).toEqual([
      "--import",
      CLI.TSX_LOADER,
      "/wt/packages/epics/tools/link.ts"
    ])
  })
})

describe("rawArgs()", () => {
  test("everything after the noun that follows dev, flags included", () => {
    const argv = process.argv
    try {
      process.argv = ["node", "spell.mjs", "dev", "docs", "open", "docs", "--all"]
      expect(rawArgs("docs")).toEqual(["open", "docs", "--all"])
      process.argv = ["node", "spell.mjs", "--verbose", "dev", "window", "dev"]
      expect(rawArgs("window")).toEqual(["dev"])
    } finally {
      process.argv = argv
    }
  })
})
