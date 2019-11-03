import parser, { unitTestModuleRules } from "../all"

describe("testing spell module lists", () => {
  unitTestModuleRules(parser, "lists")

  describe("integration tests", () => {})
})
