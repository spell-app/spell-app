import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module lists", () => {
  unitTestModuleRules(spellParser, "lists", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
