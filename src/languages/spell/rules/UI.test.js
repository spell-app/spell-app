import { unitTestModuleRules } from "../../../test"
import { spellParser } from ".."

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI")

  describe("integration tests", () => {})
})
