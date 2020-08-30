import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module assignment", () => {
  unitTestModuleRules(spellParser, "assignment", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
