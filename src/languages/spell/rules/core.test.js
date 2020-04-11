import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core")

  describe("integration tests", () => {})
})
