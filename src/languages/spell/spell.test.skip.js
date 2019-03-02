//
//  Test to make sure all rules created from rulex syntax
//  output the same syntax when compiled.
//  This is a poor-mans test to make sure things are working somewhat correctly.
//

import {
  Rule,
  spell
} from "./all.js";
import rulex from "../rulex/all.js";

const alreadyTested = {};

function testRule(rule) {
  if (!rule.syntax || alreadyTested[rule.syntax]) return;
  alreadyTested[rule.syntax] = true;

  describe(`${rule.name}:  '${rule.syntax}'`, () => {
    test(`rule.toSyntax() matches start rule`, () => {
      expect(rule.toSyntax()).toBe(rule.syntax);
    });

    const testSyntax = rule.testRule?.syntax;
    if (testSyntax) {
      test(`test   '${testSyntax}'  test.toSyntax() matches start syntax`, () => {
        expect(rule.testRule.toSyntax()).toBe(testSyntax);
      });
    }
  });
}

Object.keys(spell.rules).forEach(key => {
  const rule = spell.rules[key];
  if (rule instanceof Rule.Group)
    rule.rules.forEach(testRule);
  else
    testRule(rule);
});
