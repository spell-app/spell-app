import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants")

  describe("integration tests", () => {})
})
