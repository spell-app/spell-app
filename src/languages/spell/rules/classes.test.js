import { unitTestModuleRules } from "../../../util"
import { spellParser } from ".."

describe("testing spell module classes", () => {
  unitTestModuleRules(spellParser, "classes", "SHOW_ALL")

  describe("integration tests", () => {})
})
