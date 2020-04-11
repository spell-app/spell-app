import { unitTestModuleRules } from "../../parser"
import { rulex } from "."

describe("testing langauge rulex", () => {
  unitTestModuleRules(rulex, "rulex")
  describe("integration tests", () => {})
})
