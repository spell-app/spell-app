import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
