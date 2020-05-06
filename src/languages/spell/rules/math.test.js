import { unitTestModuleRules } from "../../../test"
import { spellParser } from ".."

describe("testing spell module math", () => {
  unitTestModuleRules(spellParser, "math")

  describe("integration tests", () => {})
})
