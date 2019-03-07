import parser, { unitTestModuleRules } from "../all.js";
import { parenthesizeCondition } from "./if.js";

describe("testing spell module if", () => {
  unitTestModuleRules(parser, "if");

  describe("\n    methods defined in rule file", () => {
    describe("parenthesizedCondition()", () => {
      test("adds parenthesis as necessary", () => {
        expect(parenthesizeCondition("a")).toBe("(a)");
      });

      test("doesn't parenthesize when not necessary", () => {
        expect(parenthesizeCondition("(a)")).toBe("(a)");
      });
    });
  });

  describe("integration tests", () => {});
});
