import parser, { unitTestModuleRules } from "../all.js"

describe("testing spell module assignment", () => {
  unitTestModuleRules(parser, "assignment")

  describe("integration tests", () => {})
})
