import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module variables", () => {
  unitTestModuleRules(spellParser, "variables")

  describe("integration tests", () => {})
})
