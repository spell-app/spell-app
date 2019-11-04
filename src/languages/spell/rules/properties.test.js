import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties")

  describe("integration tests", () => {})
})
