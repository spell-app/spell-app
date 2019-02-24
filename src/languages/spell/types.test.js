import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./all.js";

describe("testing spell module types", () => {
  unitTestModuleRules(parser, "types");

  describe("integration tests", () => {});
});
