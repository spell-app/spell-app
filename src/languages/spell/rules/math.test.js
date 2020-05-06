import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module math", () => {
  unitTestModuleRules(spellParser, "math")

  describe("integration tests", () => {})
})
