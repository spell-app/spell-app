import parser, { unitTestModuleRules } from "../all.js";

describe("testing spell module identifiers", () => {
  unitTestModuleRules(parser, "identifiers");

  describe("integration tests", () => {});
});
