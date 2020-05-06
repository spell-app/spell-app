import { Scope, ScopeVariable } from "."

// Method scope.  Expected properties:
//  - name          method name
//  - args          arguments as list of names or Variables.
//      - `args` are fixed when Method is defined.
//      - Access `args` as:
//        `method.args()`         list of all arguments
//        `method.args('name')    named argument
//
// Methods frequently define internal `variables`
//  and could possibly define internal `methods`, etc.
export class MethodScope extends Scope {
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
