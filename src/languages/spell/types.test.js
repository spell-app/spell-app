import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module types", () => {
  unitTestModuleRules(parser, "types");

  describe("integration tests", () => {});
});
