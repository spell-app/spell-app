import parser, { unitTestModuleRules } from "../all"

describe("testing spell module core", () => {
  unitTestModuleRules(parser, "core")

  describe("integration tests", () => {})
})
