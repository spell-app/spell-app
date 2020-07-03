import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module assignment", () => {
  unitTestModuleRules(spellParser, "assignment", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
