import Rule from "./Rule.js";
import Parser from "./Parser.js";

// Parsing scope.
export default class scope {
  constructor(props) {
    if (props instanceof Parser)
      this.parser = props;
    else
      Object.assign(this, props);

    if (!this.parser) throw new TypeError("Scope created without parser!");
    if (!this.rules) this.rules = this.parser.rules;
  }

  getRuleOrDie(ruleName) {
    const rule = this.rules[ruleName];
    if (!rule) throw new TypeError(`getRuleOrDie('${ruleName}'): rule not found`);
    return rule;
  }

  // Return a clone of this scope with its rules reset
  resetRules() {
    const clone = new scope(this);
    clone.rules = this.parser.rules;
    return clone;
  }

  // Return a clone of this scope, where `rules[ruleName]` without rule names in the `excludes` list.
  // Throws if rule can't be found or it's not a Group
  cloneExcludingRules(ruleName, excludes) {
    const clone = new scope(this);
    // clone the rules object so we can muck with it
    clone.rules = { ...(this.rules || this.parser.rules) };

    const rule = clone.rules[ruleName];
    if (!rule || !rule instanceof Rule.Group)
        throw new ParseError(`cloneExcludingRules(): expected ${ruleName} to be a Group!`);

    // Clone the rule and remove the excluded rules
    clone.rules[ruleName] = new Rule.Group(rule);
    clone.rules[ruleName].rules = rule.rules.filter(rule => !this.excludes.includes(rule.name));

    return clone;
  }
}
