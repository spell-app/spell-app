import { spellParser, unitTestModuleRules } from "../all"

describe("testing spell module lists", () => {
  unitTestModuleRules(spellParser, "lists")

  describe("integration tests", () => {})
})
