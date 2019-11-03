import parser, { unitTestModuleRules } from "../all"

describe("testing spell module math", () => {
  unitTestModuleRules(parser, "math")

  describe("integration tests", () => {})
})
