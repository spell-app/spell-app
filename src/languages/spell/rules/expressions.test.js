import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module expressions", () => {
  unitTestModuleRules(spellParser, "expressions")

  describe("integration tests", () => {})
})
