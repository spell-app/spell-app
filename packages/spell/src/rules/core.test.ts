import { describe } from "vitest"
import { unitTestModuleRules } from "#spell/test"
import { spellParser } from "#spell"
import { spellCore } from "#spell-core"

describe("testing spell module core", () => {
  unitTestModuleRules(spellParser, "core", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})
