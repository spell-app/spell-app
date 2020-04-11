import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties")

  describe("integration tests", () => {})
})
