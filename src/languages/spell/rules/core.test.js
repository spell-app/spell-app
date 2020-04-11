import { spellParser, unitTestModuleRules } from ".."

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core")

  describe("integration tests", () => {})
})
