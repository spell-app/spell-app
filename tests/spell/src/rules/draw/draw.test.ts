import { describe } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { core } from "$/core"

describe("testing spell module draw", () => {
  unitTestModuleRules(spellParser, "draw", core.resetRuntime)
  // describe("integration tests", () => {})
})
