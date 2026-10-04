import { describe } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})
