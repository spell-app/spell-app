import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./index.js";

describe("testing spell module UI", () => {
  unitTestModuleRules(parser, "UI");

  describe("integration tests", () => {});
});
