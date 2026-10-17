import { describe } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { core } from "$/core"

describe("testing spell module constants", () => {
  unitTestModuleRules(spellParser, "constants", core.resetRuntime)

  // describe("integration tests", () => {})
})
