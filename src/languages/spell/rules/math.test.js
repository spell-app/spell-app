import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module math", () => {
  unitTestModuleRules(spellParser, "math", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
