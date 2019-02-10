import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./index.js";

describe("testing spell module core", () => {
  unitTestModuleRules(parser, "core");

  describe("integration tests", () => {});
});
