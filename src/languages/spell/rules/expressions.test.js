import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions")

  describe("integration tests", () => {})
})
