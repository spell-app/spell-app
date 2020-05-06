import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties")

  describe("integration tests", () => {})
})
