import parser, { unitTestModuleRules } from "./all.js";

describe("testing spell module lists", () => {
  unitTestModuleRules(parser, "lists");

  describe("integration tests", () => {});
});
