import parser, { unitTestModuleRules } from "../all.js";

describe("testing spell module expressions", () => {
  unitTestModuleRules(parser, "expressions");

  describe("integration tests", () => {});
});
