import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
