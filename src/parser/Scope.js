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

  // Return a clone of this scope, removing rules in `rules[ruleName]`
  //  that have names in the `excludes` list.
  // Throws if rule can't be found or it's not a Group.
  cloneExcludingRules(ruleName, excludes) {
    const clone = new Scope(this);
    // clone the rules object so we can muck with it
    clone.rules = { ...this.rules };

    const rule = clone.getRuleOrDie(ruleName);
    if (!(rule instanceof Rule.Group))
        throw new ParseError(`cloneExcludingRules(): expected ${ruleName} to be a Group!`);

    // Clone the rule and remove the excluded rules
    clone.rules[ruleName] = rule.clone();
    clone.rules[ruleName].rules = rule.rules.filter(rule => !excludes.includes(rule.name));

    return clone;
  }

  //
  //  Scope manipulation
  //  Not that these routines modify the parser passed in!
  //

  // Add a new type to this scope.
  addType(props) {
console.warn("TODO: scope.addType()", props);
    const { type, superType } = props;
  }

  // Add a property to some object
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addProperty(props) {
console.warn("TODO: scope.addProperty()", props);
    const { type, key, datatype, value } = props;
  }

  // Add an instance property to some object.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addInstanceProperty(props) {
console.warn("TODO: scope.addInstanceProperty()");
    const { type, key, datatype, value } = props;
  }

  // Add a method to some object
  // `type` is the type to associate it with.
  //  If not provided, it will be global to the current module.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  // `returns` is the return datatype.
  addMethod(props) {
console.warn("TODO: scope.addMethod()", props);
    const { type, key, args, returns } = props;
  }

  // Add an instance method to some object
  // `type` (required) is the type to associate the method with.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  // `returns` is the return datatype.
  addInstanceMethod(props) {
console.warn("TODO: scope.addInstanceMethod()");
    const { type, key, args, datatype, value } = props;
  }

  // Add an identifier, which may be composed of more than one word!
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addIdentifier(props) {
console.warn("TODO: scope.addIdentifier()", props);
    const { key, value } = props;
  }

  // Add a constant identifier.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addConstant(props) {
console.warn("TODO: scope.addConstant()", props);
    const { key, value } = props;
  }

  // Add syntax for a new statement rule.
  addStatement(props) {
console.warn("TODO: scope.addStatement()", props);
    const { name, syntax, compile } = props;
  }

  // Add a new "is expression"
  //  `syntax` may or may not start "is"
  // TODO: auto-add "are xxx" to refer to a group?
  addIsExpression(props) {
console.warn("TODO: scope.addStatement()", props);
    const { syntax, compile } = props;
  }

}
