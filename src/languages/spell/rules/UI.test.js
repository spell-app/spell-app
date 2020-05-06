import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI")

  describe("integration tests", () => {})
})
