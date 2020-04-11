import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module assignment", () => {
  unitTestModuleRules(spellParser, "assignment")

  describe("integration tests", () => {})
})
