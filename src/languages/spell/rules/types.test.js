import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types")

  describe("integration tests", () => {})
})
