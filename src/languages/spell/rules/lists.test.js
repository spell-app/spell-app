import { unitTestModuleRules } from "~/test"
import { spellParser } from ".."

describe("testing spell module lists", () => {
  unitTestModuleRules(spellParser, "lists")

  describe("integration tests", () => {})
})
