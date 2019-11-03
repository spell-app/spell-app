import parser, { unitTestModuleRules } from "../all"

describe("testing spell module variables", () => {
  unitTestModuleRules(parser, "variables")

  describe("integration tests", () => {})
})
