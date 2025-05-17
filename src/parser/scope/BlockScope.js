import { IndexedList, snakeCase } from "~/util"
import { MethodScope, ScopeVariable } from "~/parser"
import { Scope } from "."

/**
 * `BlockScope` -- a scope which encapsulates a block of statements.
 *  - `methods` are methods defined in the block.
 *  - `variables` are variables defined in the block.
 */
export class BlockScope extends Scope {
  /** Scope `variables`. */
  /*@memoize*/
  get variables() {
    return this.memoized(
      "variables",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "scope.variables",
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
  /*@memoize*/
  get methods() {
    return this.memoized(
      "methods",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "scope.methods",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof MethodScope)) item = new MethodScope(item)
            item.scope = this.target
            return item
          }
        })
    )
  }
}
