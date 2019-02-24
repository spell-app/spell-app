import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./all.js";

describe("testing spell module core", () => {
  unitTestModuleRules(parser, "core");

  describe("integration tests", () => {});
});
