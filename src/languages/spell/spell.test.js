import spell, { Rule } from "./all.js";
import rulex from "../rulex/all.js";

const alreadyTested = {};

function testRule(rule) {
  if (!rule.syntax || alreadyTested[rule.syntax]) return;
  alreadyTested[rule.syntax] = true;

//   test(`RULE:  ${rule.name}:  '${rule.syntax}'`, () => {
//     expect(rule.toSyntax()).toBe(rule.syntax);
//   });
//
  test(`RULEX rule: ${rule.name}:  '${rule.syntax}'`, () => {
    const rulexRule = rulex.parse(rule.syntax).compile();
    expect(rulexRule.toSyntax()).toBe(rule.syntax);
  });

  if (rule.testRule && rule.testRule.syntax) {
    test(`RULEX test: ${rule.name}:  '${rule.testRule.syntax}'`, () => {
      const rulexRule = rulex.parse(rule.testRule.syntax).compile();
      expect(rulexRule.toSyntax()).toBe(rule.testRule.syntax);
    });
  }
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
