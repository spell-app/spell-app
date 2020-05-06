import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"

describe("testing spell module JSX", () => {
  unitTestModuleRules(spellParser, "JSX")

  describe("integration tests", () => {})
})
