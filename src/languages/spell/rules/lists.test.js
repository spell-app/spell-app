import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module lists", () => {
  unitTestModuleRules(spellParser, "lists", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
