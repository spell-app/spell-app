import { unitTestModuleRules } from "~/test"
import { spellParser, spellCore } from "~/languages/spell"

describe("testing spell module JSX", () => {
  unitTestModuleRules(spellParser, "JSX", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
