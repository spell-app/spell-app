import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module math", () => {
  unitTestModuleRules(spellParser, "math", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
