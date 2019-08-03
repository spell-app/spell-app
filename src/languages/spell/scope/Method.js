import assert from "assert";

import {
  Scope,
  Variable,
} from "./all.js";


// Method
// Expected properties:
//  - name
//  - args        // NOTE: we DO NOT expect args to change after Method is created!
//  - returns
export class Method extends Scope {
  constructor({ args, ...props}) {
    super(props);
    // Add `args` to our variables list
    if (args && args.length) args.forEach(arg => this.addArg(arg));
  }

  // Method arguments ("args")
  // Note that we add the arguments to the method `variables` with `kind = "argument"`
  // Use `args()` or `arg(name)` to get args back.
  addArg(arg) {
    if (!(arg instanceof Variable)) arg = new Variable(arg);
    arg.kind = "argument";
    return this.variables.add(arg);
  }

  // Call without arguments: returns all argument Variables.
  // Call with string `name`, returns named argument or `undefined`.
  args(name) {
    const args = this.variables().filter(variable => variable.kind === "argument");
    if (arguments.length === 0) return args;
    return args.find(arg => arg.name === name);
  }

  toString() {
    // TODO: needs to include arg initializers below...
    const args = this.args().map(arg => arg.name).join(", ") || "";

    // Return as an inline expression?
    if (this.asExpression) {
      const statements = this.statements || [];
      if (statements.length > 1)
        Spell.logger.warn(`Method.toString(): 'asExpression' specified but method has ${statements.length} statements.`, statements);
      const expression = ""+(statements[0]).trim();
      return `(${args}) => ${expression}`;
    }

    const statements = this.compileStatements();
    // If we're attached to a Type,
    if (this.scope instanceof Scope.Type) {
      // Add class props directly
      if (this.kind === "static")
        return `${this.scope.name}.${this.name} = function(${args}) ${statements}`;

      if (this.kind === "getter")
        return `spell.define(${this.scope.name}.prototype, '${this.name}', { get() ${statements}, configurable: true })`;

      if (this.kind === "setter")
        return `spell.define(${this.scope.name}.prototype, '${this.name}', { set(${args}) ${statements}, configurable: true })`;

      return `spell.define(${this.scope.name}.prototype, '${this.name}', { value(${args}) ${statements} })`;
    }


    // Return as a normal function
    const name = this.name ? ` ${this.name}`: "";
    return `function${name}(${args}) ${statements}`;
  }
}
Scope.Method = Method;
