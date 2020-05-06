import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests")

  describe("integration tests", () => {})
})
