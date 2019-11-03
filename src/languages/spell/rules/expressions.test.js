import parser, { unitTestModuleRules } from "../all"

describe("testing spell module expressions", () => {
  unitTestModuleRules(parser, "expressions")

  describe("integration tests", () => {})
})
