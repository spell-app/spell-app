import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module statements", () => {
  unitTestModuleRules(parser, "statements");

  describe("integration tests", () => {});
});
