import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module operators", () => {
  unitTestModuleRules(parser, "operators");

  describe("integration tests", () => {});
});
