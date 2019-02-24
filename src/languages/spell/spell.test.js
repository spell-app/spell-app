import spell, { Rule } from "./all.js";
import rulex from "../rulex/all.js";

const alreadyTested = {};

function testRule(rule) {
  if (!rule.syntax || alreadyTested[rule.syntax]) return;
  alreadyTested[rule.syntax] = true;

  test(`${rule.name}:  '${rule.syntax}'`, () => {
    const rulexRule = rulex.parse(rule.syntax).compile();
    expect(rulexRule.toSyntax()).toBe(rule.syntax);
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
