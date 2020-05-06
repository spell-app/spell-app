import { unitTestModuleRules } from "~/test"
import { spellParser } from ".."

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants")

  describe("integration tests", () => {})
})
