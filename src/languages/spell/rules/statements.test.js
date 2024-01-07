import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module statements", () => {
  unitTestModuleRules(spellParser, "statements", spellCore.resetRuntime)
  describe("integration tests", () => {})
})
