import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
