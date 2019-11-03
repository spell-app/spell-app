import { unitTestModuleRules } from "../../parser/all"
import { rulex } from "./all"

describe("testing langauge rulex", () => {
  unitTestModuleRules(rulex, "rulex")
  describe("integration tests", () => {})
})
