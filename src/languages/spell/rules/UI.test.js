import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
