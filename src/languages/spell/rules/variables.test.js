import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module variables", () => {
  unitTestModuleRules(spellParser, "variables")

  describe("integration tests", () => {})
})
