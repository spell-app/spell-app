import parser, { unitTestModuleRules } from "../all"

describe("testing spell module constants", () => {
  unitTestModuleRules(parser, "constants")

  describe("integration tests", () => {})
})
