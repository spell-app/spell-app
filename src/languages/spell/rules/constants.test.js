import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
