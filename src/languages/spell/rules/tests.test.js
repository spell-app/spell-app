import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module tests", () => {
  unitTestModuleRules(spellParser, "tests")

  describe("integration tests", () => {})
})
