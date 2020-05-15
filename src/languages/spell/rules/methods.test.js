import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module methods", () => {
  unitTestModuleRules(spellParser, "methods", "SHOW_ALL")
  describe("integration tests", () => {})
})
