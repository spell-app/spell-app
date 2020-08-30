import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
