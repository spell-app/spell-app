import parser, { unitTestModuleRules } from "../all.js"

describe("testing spell module math", () => {
  unitTestModuleRules(parser, "math")

  describe("integration tests", () => {})
})
