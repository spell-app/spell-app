import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./all.js";

describe("testing spell module statements", () => {
  unitTestModuleRules(parser, "statements");

  describe("integration tests", () => {});
});
