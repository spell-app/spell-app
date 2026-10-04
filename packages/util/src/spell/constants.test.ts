import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { PACKAGE_VERSION } from "$/util"

describe("`PACKAGE_VERSION`", () => {
  // every spell-family package shares one version, `spell`'s, which vite hands over
  test("is our package.json's version -- handed over by vite", () => {
    const { version } = JSON.parse(
      readFileSync(resolve(import.meta.dirname, "..", "..", "..", "spell", "package.json"), "utf8")
    )
    expect(PACKAGE_VERSION).toBe(version)
  })
})
