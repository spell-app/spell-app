import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./index.js";

describe("testing spell module lists", () => {
  unitTestModuleRules(parser, "lists");

  describe("integration tests", () => {});
});
