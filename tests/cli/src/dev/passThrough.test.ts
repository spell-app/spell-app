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

describe("toolArgs()", () => {
  test("plain node:  just the script, in the tool's checkout", () => {
    expect(CLI.toolArgs(CLI.TOOLS.window, "/wt")).toEqual(["/wt/scripts/window.mjs"])
  })
  test("tsx:  the CLI checkout's loader first", () => {
    expect(CLI.toolArgs(CLI.TOOLS["docs link"], "/wt")).toEqual([
      "--import",
      CLI.TSX_LOADER,
      "/wt/packages/docs/tools/link.ts"
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
