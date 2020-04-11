import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants")

  describe("integration tests", () => {})
})
