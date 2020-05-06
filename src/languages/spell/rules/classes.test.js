import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module classes", () => {
  unitTestModuleRules(spellParser, "classes", "SHOW_ALL")

  describe("integration tests", () => {})
})
