import parser, { unitTestModuleRules } from "../all"

describe("testing spell module properties", () => {
  unitTestModuleRules(parser, "properties")

  describe("integration tests", () => {})
})
