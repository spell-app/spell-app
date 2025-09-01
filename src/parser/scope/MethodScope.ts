import { BlockScope } from "./BlockScope"
import { ScopeProps, ScopeVariable } from "."

export type MethodScopeProps = {
  args?: ScopeVariable[]
  thisVar?: string
  mapItTo?: string
}

/**
 * `MethodScope` -- a scope which encapsulates a method definition.
 *  - `name` is the method name, if any.
 *  - `args` are argument `ScopeVariables`, which are fixed upon construction.
 *     Use `methodScope.args()` or `.args(<argName>)` for arg access.
 *  - `variables` (from BlockScope) are variables within the method, and include `args` set on construction.
 *  - `methods` (from BlockScope) are methods defined within the method.
 *  - `thisVar` (optional) variable name which will map to `this` if set on construction.
 *  - `mapItTo` (optional) map `it` to output var name.
 */
export class MethodScope extends BlockScope {
  declare thisVar: string
  declare mapItTo: string

  constructor({ args, ...props }: MethodScopeProps) {
    super(props as ScopeProps)
    // Add `args` to our variables list
    if (args && args.length) {
      args.forEach((arg: ScopeVariable) => {
        if (!(arg instanceof ScopeVariable)) arg = new ScopeVariable(arg)
        arg.kind = "argument"
        return this.variables.add(arg)
      })
    }
    // Define variables for thisVar and `it`.
    // Note that `its` automatically maps to `this`.
    const { thisVar, mapItTo } = this
    if (thisVar && !this.variables.get(thisVar, "LOCAL_ONLY")) {
      // TODO: scope:this ??
      this.variables.add({ name: thisVar, output: "this", isAlias: true })
    }
    if (mapItTo && !this.variables.get("it", "LOCAL_ONLY")) {
      // TODO: scope:this ??
      this.variables.add({ name: "it", output: mapItTo, isAlias: true })
    }
  }

  // Call without arguments: returns all argument Variables.
  // Call with string `name`, returns named argument or `undefined`.
  args(): ScopeVariable[]
  args(name: string): ScopeVariable
  args(name?: string) {
    const args = this.variables.get().filter((variable) => variable.kind === "argument")
    if (arguments.length === 0) return args
    return args.find((arg) => arg.name === name)
  }
}
