import { describe, test, expect } from "vitest"
import { unitTestModuleRules } from "~/test"
import { rulex } from "~/languages/rulex"

describe("testing language rulex", () => {
  unitTestModuleRules(rulex, "rulex")
  // describe("integration tests", () => {})
})
