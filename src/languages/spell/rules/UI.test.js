import parser, { unitTestModuleRules } from "../all.js"

describe("testing spell module UI", () => {
  unitTestModuleRules(parser, "UI")

  describe("integration tests", () => {})
})
