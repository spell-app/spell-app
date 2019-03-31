import parser, { unitTestModuleRules } from "./all.js";

describe("testing langauge rulex", () => {
  unitTestModuleRules(parser, "rulex");

  describe("integration tests", () => {});
});
