import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module classes", () => {
  unitTestModuleRules(parser, "classes", "SHOW_ALL");

  describe("integration tests", () => {});
});
