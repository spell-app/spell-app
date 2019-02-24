import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./all.js";

describe("testing spell module UI", () => {
  unitTestModuleRules(parser, "UI");

  describe("integration tests", () => {});
});
