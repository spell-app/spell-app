import {
  Rule,
  Parser,
  ParseError
} from "./all.js";

// Parsing scope.
export class Scope {
  constructor(props) {
    if (props instanceof Parser)
      this.parser = props;
    else
      Object.assign(this, props);

    if (!this.parser) throw new ParseError("Scope created without parser!");
    if (!this.rules) this.rules = this.parser.rules;
  }

  getRuleOrDie(ruleName) {
    const rule = this.rules[ruleName];
    if (!rule) throw new ParseError(`getRuleOrDie('${ruleName}'): rule not found`);
    return rule;
  }

  // Return a clone of this scope with its rules reset.
  resetRules() {
    const clone = new Scope(this);
    clone.rules = this.parser.rules;
    return clone;
  }

  // Return a clone of this scope, where `rules[ruleName]` without rule names in the `excludes` list.
  // Throws if rule can't be found or it's not a Group.
  cloneExcludingRules(ruleName, excludes) {
    const clone = new Scope(this);
    // clone the rules object so we can muck with it
    clone.rules = { ...this.rules };

    const rule = clone.getRuleOrDie(ruleName);
    if (!(rule instanceof Rule.Group))
        throw new ParseError(`cloneExcludingRules(): expected ${ruleName} to be a Group!`);

    // Clone the rule and remove the excluded rules
    clone.rules[ruleName] = new Rule.Group(rule);
    clone.rules[ruleName].rules = rule.rules.filter(rule => !excludes.includes(rule.name));

    return clone;
  }
}
