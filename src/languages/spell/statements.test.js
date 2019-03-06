import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module statement", () => {
  unitTestModuleRules(parser, "statement");

  describe("integration tests", () => {});
});
