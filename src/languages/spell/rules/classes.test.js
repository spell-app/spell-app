import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module classes", () => {
  unitTestModuleRules(spellParser, "classes", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
