import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
