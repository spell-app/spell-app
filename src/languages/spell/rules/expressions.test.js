import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions")

  describe("integration tests", () => {})
})
