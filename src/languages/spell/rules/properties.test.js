import parser, { unitTestModuleRules } from "../all.js"

describe("testing spell module properties", () => {
  unitTestModuleRules(parser, "properties")

  describe("integration tests", () => {})
})
