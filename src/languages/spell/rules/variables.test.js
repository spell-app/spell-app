import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module variables", () => {
  unitTestModuleRules(spellParser, "variables")

  describe("integration tests", () => {})
})
