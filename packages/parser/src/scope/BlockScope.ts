import { snakeCase } from "$/util"
import { P } from "$/parser"
import { Scope } from "./Scope"

/**
 * `BlockScope` -- a scope which encapsulates a block of statements.
 *  - `methods` are records of methods / functions defined in the block -- see `ScopeMethod`.
 *  - `variables` are variables defined in the block.
 */
export class BlockScope extends Scope {
  /**
   * Named `ScopeVariable`s declared in this block, keyed by (snake_case-normalized) name.
   * Falls through to `parentScope.variables` if not found locally.
   */
  get variables(): P.ScopeList<P.ScopeVariable, string | P.ScopeVariable | P.ScopeVariableProps> {
    return this.derived(
      "variables",
      () =>
        new P.ScopeList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.variables",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.ScopeVariable)) item = new P.ScopeVariable(item)
            item.scope = this.target
            return item
          }
        })
    )
  }

  /**
   * `ScopeMethod` records of methods / functions declared in this block, keyed by (snake_case-normalized) name.
   * - Falls through to `parentScope.methods` if not found locally.
   * - A `TypeScope`'s are its instance methods;  a project's, its free functions -- see `ScopeMethod`.
   */
  get methods(): P.ScopeList<P.ScopeMethod, P.ScopeMethod | P.ScopeMethodProps> {
    return this.derived(
      "methods",
      () =>
        new P.ScopeList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.methods",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.ScopeMethod)) item = new P.ScopeMethod(item)
            item.scope = this.target
            return item
          }
        })
    )
  }
}
