import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module async", () => {
  unitTestModuleRules(spellParser, "async", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
