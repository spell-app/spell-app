import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests")

  describe("integration tests", () => {})
})
