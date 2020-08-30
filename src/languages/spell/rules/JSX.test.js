import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module JSX", () => {
  unitTestModuleRules(spellParser, "JSX", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
