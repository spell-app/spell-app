import { IndexedList, snakeCase } from "~/util"
import { P } from "~/parser"
import { Scope } from "./Scope"

/**
 * `BlockScope` -- a scope which encapsulates a block of statements.
 *  - `methods` are methods defined in the block.
 *  - `variables` are variables defined in the block.
 */
export class BlockScope extends Scope {
  /**
   * Named `ScopeVariable`s declared in this block, keyed by (snake_case-normalized) name.
   * Falls through to `parentScope.variables` if not found locally.
   */
  get variables(): IndexedList<P.ScopeVariable, string | P.ScopeVariable | P.ScopeVariableProps> {
    return this.derived(
      "variables",
      () =>
        new IndexedList({
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
   * Named `MethodScope`s declared in this block, keyed by (snake_case-normalized) name.
   * Falls through to `parentScope.methods` if not found locally.
   */
  get methods(): IndexedList<P.MethodScope, P.MethodScope | P.MethodScopeProps> {
    return this.derived(
      "methods",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.methods",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.MethodScope)) item = new P.MethodScope(item)
            item.parentScope = this.target
            return item
          }
        })
    )
  }
}
