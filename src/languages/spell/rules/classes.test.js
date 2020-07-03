import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module classes", () => {
  unitTestModuleRules(spellParser, "classes", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
