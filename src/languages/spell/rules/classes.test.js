import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module classes", () => {
  unitTestModuleRules(spellParser, "classes", "SHOW_ALL")

  describe("integration tests", () => {})
})
