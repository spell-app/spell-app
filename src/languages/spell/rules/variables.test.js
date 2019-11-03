import parser, { unitTestModuleRules } from "../all.js"

describe("testing spell module variables", () => {
  unitTestModuleRules(parser, "variables")

  describe("integration tests", () => {})
})
