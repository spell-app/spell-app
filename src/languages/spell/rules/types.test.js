import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types")

  describe("integration tests", () => {})
})
