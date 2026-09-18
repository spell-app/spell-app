import { IndexedList, snakeCase } from "~/util"
import type { P } from "~/parser"
import { Scope } from "./Scope"
import { MethodScope, ScopeVariable } from "."

/**
 * `BlockScope` -- a scope which encapsulates a block of statements.
 *  - `methods` are methods defined in the block.
 *  - `variables` are variables defined in the block.
 */
export class BlockScope extends Scope {
  /** Scope `variables`. */
  get variables(): IndexedList<ScopeVariable, string | ScopeVariable | P.ScopeVariableProps> {
    return this.derived(
      "variables",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.variables",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof ScopeVariable)) item = new ScopeVariable(item)
            item.scope = this.target
            return item
          }
        })
    )
  }

  /** Scope `methods`. */
  get methods(): IndexedList<MethodScope, MethodScope | P.MethodScopeProps> {
    return this.derived(
      "methods",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.methods",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof MethodScope)) item = new MethodScope(item)
            item.parentScope = this.target
            return item
          }
        })
    )
  }
}
