import { unitTestModuleRules } from "../../../test"
import { spellParser } from ".."

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core")

  describe("integration tests", () => {})
})
