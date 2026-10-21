import { join } from "node:path"
import { describe, expect, test } from "vite-plus/test"

import { AS } from "spell-kit/assembler"

import { CliError } from "$/cli/cli.types"
import { bundlesCommand } from "$/cli/commands/bundlesCommand"

describe("bundlesCommand()", () => {
  test("a missing or unknown verb, or an unknown bundle, is a CliError naming the choices", async () => {
    await expect(bundlesCommand([])).rejects.toThrow(new CliError("which bundles command?  build, check"))
    await expect(bundlesCommand(["make"])).rejects.toThrow(new CliError("unknown verb 'make':  build, check"))
    await expect(bundlesCommand(["check", "nope"])).rejects.toThrow(
      new CliError("no bundle 'nope';  bundles:  ui-site, brand")
    )
  })
})

// the ONE list:  the page server waits on these folders (page-server's `BundleBuild`), the CLI builds their bundles
// (moved here from spell-server's Bundle tests, epic `repo-split` P8:  it's spell-app's own settings)
describe("spell-app's bundles", () => {
  test("the root package.json's list names every bundle, each once", () => {
    const outputs = AS.Bundle.specs(join(import.meta.dirname, "../../../..")).map((spec) => spec.name)
    expect([...outputs].sort()).toEqual(AS.BUNDLES.map((spec) => spec.name).sort())
    expect(new Set(outputs).size).toBe(outputs.length)
  })
})
