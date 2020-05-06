import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants")

  describe("integration tests", () => {})
})
