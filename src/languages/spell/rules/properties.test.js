import { unitTestModuleRules } from "~/test"
import { spellParser } from ".."

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties")

  describe("integration tests", () => {})
})
