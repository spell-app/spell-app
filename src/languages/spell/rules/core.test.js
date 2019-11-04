import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core")

  describe("integration tests", () => {})
})
