import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./spell.js";

describe("testing spell module operators", () => {
  unitTestModuleRules(parser, "operators");

  describe("integration tests", () => {});
});
