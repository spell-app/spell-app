import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core")

  describe("integration tests", () => {})
})
