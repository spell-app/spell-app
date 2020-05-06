import { unitTestModuleRules } from "~/test"
import { spellParser } from ".."

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests")

  describe("integration tests", () => {})
})
