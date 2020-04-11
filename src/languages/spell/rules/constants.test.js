import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants")

  describe("integration tests", () => {})
})
