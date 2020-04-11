import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module assignment", () => {
  unitTestModuleRules(spellParser, "assignment")

  describe("integration tests", () => {})
})
