import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types")

  describe("integration tests", () => {})
})
