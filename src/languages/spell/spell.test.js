import spell, { Rule } from "./all.js";
import rulex from "../rulex/all.js";

const alreadyTested = {};

function testRule(rule) {
  if (!rule.syntax || alreadyTested[rule.syntax]) return;
  alreadyTested[rule.syntax] = true;

  describe(rule.name, () => {
    test(`rule   '${rule.syntax}'`, () => {
      expect(rule.toSyntax()).toBe(rule.syntax);
    });

    test(`RULEX  '${rule.syntax}'`, () => {
      const rulexRule = rulex.parse(rule.syntax).compile();
      expect(rulexRule.toSyntax()).toBe(rule.syntax);
//      expect(rulexRule).toEqual(rule);
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
