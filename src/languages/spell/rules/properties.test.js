import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module properties", () => {
  unitTestModuleRules(spellParser, "properties")

  describe("integration tests", () => {})
})
