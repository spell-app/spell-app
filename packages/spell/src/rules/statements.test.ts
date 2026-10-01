import { describe } from "vitest"
import { unitTestModuleRules } from "#spell/test"
import { spellParser } from "#spell"
import { spellCore } from "#spell-core"

describe("testing spell module statements", () => {
  unitTestModuleRules(spellParser, "statements", spellCore.resetRuntime)
  // describe("integration tests", () => {})
})
