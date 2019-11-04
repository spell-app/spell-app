import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types")

  describe("integration tests", () => {})
})
