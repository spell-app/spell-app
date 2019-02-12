import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./spell.js";

describe("testing spell module core", () => {
  unitTestModuleRules(parser, "core");

  describe("integration tests", () => {});
});
