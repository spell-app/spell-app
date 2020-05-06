import { unitTestModuleRules } from "../../../test"
import { spellParser } from ".."

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types")

  describe("integration tests", () => {})
})
