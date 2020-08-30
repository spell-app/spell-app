import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
