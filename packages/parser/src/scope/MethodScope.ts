import { P } from "$/parser"
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
 *  - `itDatatype` (optional) what `thisVar` and `it` are, e.g. `Card` in a method of cards, or a loop's item type.
 */
export class MethodScope extends BlockScope {
  /** Variable name which will map to `this`, if set on construction. */
  declare thisVar: string
  /** Map `it` to this output var name, if set on construction. */
  declare mapItTo: string
  /** What `thisVar` and `it` are, if set on construction, e.g. `Card` -- their alias variables' `datatype`. */
  declare itDatatype: P.Datatype | undefined

  /**
   * Create with optional `args` (added to `variables` with `kind: "argument"`), and set up `thisVar`/
   * `mapItTo` as variable aliases if not already locally defined.
   * - `declaredBy` is the statement match which made this scope.  Every variable we add here takes it
   *   as its own `declaredBy`, unless it already has a more precise one.
   */
  constructor({ args, declaredBy, ...props }: MethodScopeProps) {
    super(props)
    // Add `args` to our variables list
    if (args && args.length) {
      args.forEach((input) => {
        const arg = input instanceof P.ScopeVariable ? input : new P.ScopeVariable(input)
        arg.kind = "argument"
        arg.declaredBy ??= declaredBy
        this.variables.add(arg)
      })
    }
    // Define variables for thisVar and `it`.
    // Note that `its` automatically maps to `this`.
    const { thisVar, mapItTo, itDatatype: datatype } = this
    if (thisVar && !this.variables.get(thisVar, "LOCAL_ONLY")) {
      // TODO: scope:this ??
      this.variables.add({ name: thisVar, output: "this", isAlias: true, datatype, declaredBy })
    }
    if (mapItTo && !this.variables.get("it", "LOCAL_ONLY")) {
      // TODO: scope:this ??
      this.variables.add({ name: "it", output: mapItTo, isAlias: true, datatype, declaredBy })
    }
  }

  /**
   * Call with no `name` to return all argument `variables`.
   * Call with `name` to return that named argument, or `undefined` if not found.
   */
  args(): P.ScopeVariable[]
  args(name: string): P.ScopeVariable
  args(name?: string) {
    const args = this.variables.get().filter((variable) => variable.kind === "argument")
    if (arguments.length === 0) return args
    return args.find((arg) => arg.name === name)
  }
}

/** Constructor props for `MethodScope`. */
export type MethodScopeProps = P.ScopeProps & {
  /** Method arguments, added to `variables` with `kind: "argument"`. */
  args?: Array<P.ScopeVariable | string | P.ScopeVariableProps>
  /** Variable name which will map to `this`. */
  thisVar?: string
  /** Map `it` to this output var name. */
  mapItTo?: string
  /** What `thisVar` and `it` are, e.g. `Card` -- see `MethodScope.itDatatype`. */
  itDatatype?: P.Datatype
  /** Statement match which made this scope -- `declaredBy` for the variables it adds. */
  declaredBy?: P.Match
}
