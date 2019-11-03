import parser, { unitTestModuleRules } from "../all"

describe("testing spell module tests", () => {
  unitTestModuleRules(parser, "tests")

  describe("integration tests", () => {})
})
