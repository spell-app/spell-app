import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
