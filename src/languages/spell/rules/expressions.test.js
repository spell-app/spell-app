import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
