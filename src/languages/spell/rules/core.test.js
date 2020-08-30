import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
