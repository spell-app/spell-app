import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module async", () => {
  unitTestModuleRules(spellParser, "async", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
