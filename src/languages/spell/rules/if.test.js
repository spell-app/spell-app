import { describe, test, expect } from "vitest"
import { unitTestModuleRules } from "~/test"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"

describe("testing spell module if", () => {
  unitTestModuleRules(spellParser, "if", spellCore.resetRuntime)

  // describe("integration tests", () => {})
})
