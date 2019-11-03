import parser, { unitTestModuleRules } from "./all"

describe("testing langauge rulex", () => {
  unitTestModuleRules(parser, "rulex")

  describe("integration tests", () => {})
})
