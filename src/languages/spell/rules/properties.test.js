import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
