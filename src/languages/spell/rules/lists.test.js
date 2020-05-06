import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module lists", () => {
  unitTestModuleRules(spellParser, "lists")

  describe("integration tests", () => {})
})
