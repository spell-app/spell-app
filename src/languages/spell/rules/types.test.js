import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
