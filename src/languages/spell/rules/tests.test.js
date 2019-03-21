import parser, { unitTestModuleRules } from "../all.js";

describe("testing spell module tests", () => {
  unitTestModuleRules(parser, "tests");

  describe("integration tests", () => {});
});
