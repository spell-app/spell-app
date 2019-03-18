import parser, { unitTestModuleRules } from "../all.js";

describe("testing spell module constants", () => {
  unitTestModuleRules(parser, "constants");

  describe("integration tests", () => {});
});
