import parser, { unitTestModuleRules } from "../all"

describe("testing spell module types", () => {
  unitTestModuleRules(parser, "types")

  describe("integration tests", () => {})
})
