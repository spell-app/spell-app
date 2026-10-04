import { describe } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"

describe("testing spell module UI", () => {
  unitTestModuleRules(spellParser, "UI", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})
