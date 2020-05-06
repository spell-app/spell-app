import { BlockScope, ScopeVariable } from "."

/**
 * `MethodScope` -- a scope which encapsulates a method definition.
 *  - `name` is the method name, if any.
 *  - `args` are argument `ScopeVariables`, which are fixed upon construction.
 *     Use `methodScope.args()` or `.args(<argName>)` for arg access.
 *  - `variables` (from BlockScope) are variables within the method, and include `args`.
 *  - `methods` (from BlockScope) are methods defined within the method.
 */
export class MethodScope extends BlockScope {
  constructor({ args, ...props }) {
    super(props)
    // Add `args` to our variables list
    if (args && args.length) {
      args.forEach(arg => {
        if (!(arg instanceof ScopeVariable)) arg = new ScopeVariable(arg)
        arg.kind = "argument"
        return this.variables.add(arg)
      })
    }
  }

  // Call without arguments: returns all argument Variables.
  // Call with string `name`, returns named argument or `undefined`.
  args(name) {
    const args = this.variables.get().filter(variable => variable.kind === "argument")
    if (arguments.length === 0) return args
    return args.find(arg => arg.name === name)
  }
}
