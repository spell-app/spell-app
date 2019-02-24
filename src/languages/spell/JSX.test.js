import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./all.js";

describe("testing spell module JSX", () => {
  unitTestModuleRules(parser, "JSX");

  describe("integration tests", () => {});
});
