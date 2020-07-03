import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
