import { describe } from "vite-plus/test"
import { unitTestModuleRules } from "$/parser/test"
import { rulex } from "$/parser/rulex"

describe("testing language rulex", () => {
  unitTestModuleRules(rulex, "rulex")
  // describe("integration tests", () => {})
})
