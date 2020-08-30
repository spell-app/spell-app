import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
