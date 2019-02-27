import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module classes", () => {
  unitTestModuleRules(parser, "classes");

  describe("integration tests", () => {});
});
