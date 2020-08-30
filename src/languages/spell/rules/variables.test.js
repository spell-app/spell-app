import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module variables", () => {
  unitTestModuleRules(spellParser, "variables", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
