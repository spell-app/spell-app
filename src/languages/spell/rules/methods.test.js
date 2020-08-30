import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module methods", () => {
  unitTestModuleRules(spellParser, "methods", spellCore.resetRuntime)
  describe("integration tests", () => {})
})
