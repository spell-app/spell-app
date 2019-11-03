import parser, { unitTestModuleRules } from "../all"

describe("testing spell module assignment", () => {
  unitTestModuleRules(parser, "assignment")

  describe("integration tests", () => {})
})
