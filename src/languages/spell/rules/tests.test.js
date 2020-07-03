import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
