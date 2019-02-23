import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./rulex.js";

describe("testing langauge rulex", () => {
  unitTestModuleRules(parser, "rulex");

  describe("integration tests", () => {});
});
