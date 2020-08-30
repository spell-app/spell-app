import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spell-core"

describe("testing spell module JSX", () => {
  unitTestModuleRules(spellParser, "JSX", spellCore.resetRuntime)

  describe("integration tests", () => {})
})
