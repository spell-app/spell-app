import { describe, expect, test } from "vite-plus/test"

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
