import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions")

  describe("integration tests", () => {})
})
