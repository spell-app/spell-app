import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
