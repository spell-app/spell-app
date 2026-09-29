import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vitest"

import environment from "~/environment"
import { PACKAGE_VERSION } from "~/util"

describe("`PACKAGE_VERSION`", () => {
  test("is our package.json's version -- handed over by vite", () => {
    const { version } = JSON.parse(readFileSync(resolve(environment.srcDir, "..", "package.json"), "utf8"))
    expect(PACKAGE_VERSION).toBe(version)
  })
})
