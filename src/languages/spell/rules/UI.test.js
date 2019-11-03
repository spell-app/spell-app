import parser, { unitTestModuleRules } from "../all"

describe("testing spell module UI", () => {
  unitTestModuleRules(parser, "UI")

  describe("integration tests", () => {})
})
