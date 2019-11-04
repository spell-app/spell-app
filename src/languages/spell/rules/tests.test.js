import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests")

  describe("integration tests", () => {})
})
