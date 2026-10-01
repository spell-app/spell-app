import { describe } from "vitest"
import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "#spell-core"

describe("testing spell module statements", () => {
  unitTestModuleRules(spellParser, "statements", spellCore.resetRuntime)
  // describe("integration tests", () => {})
})
