import {
  Rule,
  Parser,
  ParseError
} from "./all.js";

// Parsing scope.
export class Scope {
  constructor(props) {
    if (props instanceof Parser) props = { parser: props };
    Object.assign(this, props);
    if (!this.parser) throw new ParseError("Scope created without parser!");
  }

  getRuleOrDie(ruleName) {
    let rule = this.parser.rules[ruleName];
    if (!rule) throw new ParseError(`getRuleOrDie('${ruleName}'): rule not found`);

    if (this.excludes && this.excludes[ruleName]) {
      const excludes = this.excludes[ruleName];
      rule = rule.clone();
      rule.rules = rule.rules.filter(rule => !excludes.includes(rule.name));
    }
    return rule;
  }

  // Return a clone of this scope with all `excludes` reset
  resetRules() {
    const clone = new Scope(this);
    delete clone.excludes;
    return clone;
  }

  // Return a clone of this scope, removing rules in `rules[ruleName]`
  //  that `exclude` another named rule.
  //
  // Throws if rule can't be found or it's not a Group.
  cloneExcludingRules(ruleName, exclude) {
    // throw if rule is not a Group
    const rule = this.getRuleOrDie(ruleName);
    if (!(rule instanceof Rule.Group))
        throw new ParseError(`cloneExcludingRules(): expected ${ruleName} to be a Group!`);

    const clone = new Scope(this);
    // clone the `excludes` map if we have one
    clone.excludes = {...clone.excludes};
    clone.excludes[ruleName] = clone.excludes[ruleName]
      ? clone.excludes[ruleName].concat(exclude)
      : [exclude];
    return clone;
  }

  //
  //  Scope manipulation
  //  Not that these routines modify the parser passed in!
  //

  // Add a new type to this scope.
  addType(props) {
    this.parser.info("TODO: scope.addType()", props);
    const { type, superType } = props;
  }

  // Add a property to some object
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addProperty(props) {
    this.parser.info("TODO: scope.addProperty()", props);
    const { type, key, datatype, value } = props;
  }

  // Add an instance property to some object.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addInstanceProperty(props) {
    this.parser.info("TODO: scope.addInstanceProperty()", props);
    const { type, key, datatype, value } = props;
  }

  // Add a method to some object
  // `type` is the type to associate it with.
  //  If not provided, it will be global to the current module.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  // `returns` is the return datatype.
  addMethod(props) {
    this.parser.info("TODO: scope.addMethod()", props);
    const { type, key, args, returns } = props;
  }

  // Add an instance method to some object
  // `type` (required) is the type to associate the method with.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  // `returns` is the return datatype.
  addInstanceMethod(props) {
    this.parser.info("TODO: scope.addInstanceMethod()", props);
    const { type, key, args, datatype, value } = props;
  }

  // Add an identifier, which may be composed of more than one word!
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addIdentifier(props) {
    this.parser.info("TODO: scope.addIdentifier()", props);
    const { key, value } = props;
  }

  // Add a constant identifier.
  // `key` may be a string or an array (will be used as `literals` for a rule)
  addConstant(props) {
    this.parser.info("TODO: scope.addConstant()", props);
    const { key, value } = props;
  }

  // Add syntax for a new statement rule.
  addStatement(props) {
    this.parser.info("TODO: scope.addStatement()", props);
    const { name, syntax, compile } = props;
    try {
      const rule = this.parser.defineRule({ name, syntax, compile });
      this.parser.info("defined rule: ", rule);
    }
    catch(e) { console.error(e); }
  }

  // Add a new "is expression"
  //  `syntax` may or may not start "is"
  // TODO: auto-add "are xxx" to refer to a group?
  addIsExpression(props) {
    this.parser.info("TODO: scope.addIsExpression()", props);
    const { syntax, compile } = props;
  }

}
