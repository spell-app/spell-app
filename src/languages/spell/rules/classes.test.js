import parser, { unitTestModuleRules } from "../all"

describe("testing spell module classes", () => {
  unitTestModuleRules(parser, "classes", "SHOW_ALL")

  describe("integration tests", () => {})
})
