import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module variables", () => {
  unitTestModuleRules(spellParser, "variables")

  describe("integration tests", () => {})
})
