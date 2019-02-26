import {
  parseRule,
  Rule,
  spell
} from "./all.js";
import rulex from "../rulex/all.js";

const alreadyTested = {};

function testRule(rule) {
  if (!rule.syntax || alreadyTested[rule.syntax]) return;
  alreadyTested[rule.syntax] = true;

  describe(`${rule.name}:  '${rule.syntax}'`, () => {
    test(`rule.toSyntax() matched`, () => {
      expect(rule.toSyntax()).toBe(rule.syntax);
    });

    let rulexRule;
    test("RULEX compiles", () => {
      expect(()=> rulexRule = rulex.parse(rule.syntax).compile()).not.toThrow();
    });

    test("RULEX.toSyntax() matches", () => {
      expect(rulexRule.toSyntax()).toBe(rule.syntax);
    });

    test("RULEX.compile matches", () => {
      const minimalParsedRule = parseRule(rule.syntax);
      expect(rulexRule).toEqual(minimalParsedRule);
    });

    const testSyntax = rule.testRule?.syntax;
    if (testSyntax) {
      test(`test   '${testSyntax}'`, () => {
        const rulexRule = rulex.parse(testSyntax).compile();
        rulexRule.syntax = testSyntax;

        expect(rulexRule.toSyntax()).toBe(testSyntax);
        expect(rulexRule).toEqual(rule.testRule);
      });
    }
  });
}

//describe("testing rulex parsing vs old parseRule()", () => {
  Object.keys(spell.rules).forEach(key => {
    const rule = spell.rules[key];
    if (rule instanceof Rule.Group)
      rule.rules.forEach(testRule);
    else
      testRule(rule);
  });
//});
