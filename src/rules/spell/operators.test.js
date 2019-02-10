import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./index.js";

describe("testing spell module operators", () => {
  unitTestModuleRules(parser, "operators");

  describe("integration tests", () => {});
});
