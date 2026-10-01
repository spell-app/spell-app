import { describe } from "vitest"
import { unitTestModuleRules } from "$/spell/test"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"

describe("testing spell module types", () => {
  unitTestModuleRules(spellParser, "types", spellCore.resetRuntime)
  // describe("integration tests", () => {})
})
