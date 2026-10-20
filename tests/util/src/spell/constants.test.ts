import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { PACKAGE_VERSION } from "$/util"

describe("`PACKAGE_VERSION`", () => {
  // the version of the package under test, util's own, which vite hands over (`vite.packageVersion.ts`)
  test("is our package.json's version -- handed over by vite", () => {
    const { version } = JSON.parse(
      readFileSync(resolve(import.meta.dirname, "../../../../packages/util/package.json"), "utf8")
    )
    expect(PACKAGE_VERSION).toBe(version)
  })
})
