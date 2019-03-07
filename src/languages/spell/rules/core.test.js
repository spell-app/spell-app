import parser, { unitTestModuleRules } from "../all.js";

describe("testing spell module core", () => {
  unitTestModuleRules(parser, "core");

  describe("integration tests", () => {});
});
