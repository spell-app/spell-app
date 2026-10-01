import { describe } from "vitest"
import { unitTestModuleRules } from "#spell/test"
import { spellParser } from "#spell"
import { spellCore } from "#spell-core"

describe("testing spell module async", () => {
  unitTestModuleRules(spellParser, "async", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})
