import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./index.js";

describe("testing spell module types", () => {
  unitTestModuleRules(parser, "types");

  describe("integration tests", () => {});
});
