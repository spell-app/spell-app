import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI")

  describe("integration tests", () => {})
})
