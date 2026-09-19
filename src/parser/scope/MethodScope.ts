import { P } from "~/parser"
import { BlockScope } from "./BlockScope"

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
  /** Set to `true` (e.g. by an `await` expression in the body) to compile the method as `async`. */
  declare async: boolean | undefined

  constructor({ args, ...props }: MethodScopeProps) {
    super(props)
    // Add `args` to our variables list
    if (args && args.length) {
      args.forEach((input) => {
        const arg = input instanceof P.ScopeVariable ? input : new P.ScopeVariable(input)
        arg.kind = "argument"
        this.variables.add(arg)
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
  args(): P.ScopeVariable[]
  args(name: string): P.ScopeVariable
  args(name?: string) {
    const args = this.variables.get().filter((variable) => variable.kind === "argument")
    if (arguments.length === 0) return args
    return args.find((arg) => arg.name === name)
  }
}

export type MethodScopeProps = P.ScopeProps & {
  args?: Array<P.ScopeVariable | string | P.ScopeVariableProps>
  thisVar?: string
  mapItTo?: string
  async?: boolean
}
