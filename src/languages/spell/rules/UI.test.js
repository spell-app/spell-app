import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI")

  describe("integration tests", () => {})
})
