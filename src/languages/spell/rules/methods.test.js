import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module methods", () => {
  unitTestModuleRules(spellParser, "methods", spellCore.resetRuntime)
  describe("integration tests", () => {})
})
