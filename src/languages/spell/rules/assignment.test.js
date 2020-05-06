import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module assignment", () => {
  unitTestModuleRules(spellParser, "assignment")

  describe("integration tests", () => {})
})
