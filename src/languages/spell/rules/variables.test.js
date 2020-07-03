import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module variables", () => {
  unitTestModuleRules(spellParser, "variables", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
