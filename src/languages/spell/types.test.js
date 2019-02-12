import unitTestModuleRules from "../../utils/unitTestRules.js";
import parser from "./spell.js";

describe("testing spell module types", () => {
  unitTestModuleRules(parser, "types");

  describe("integration tests", () => {});
});
