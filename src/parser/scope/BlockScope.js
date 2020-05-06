import { IndexedList, memoize, snakeCase } from ".."
import { Scope, MethodScope, ScopeVariable } from "."

/**
 * `BlockScope` -- a scope which encapsulates a block of statements.
 *  - `methods` are methods defined in the block.
 *  - `variables` are variables defined in the block.
 */
export class BlockScope extends Scope {
  /** Scope `variables`. */
  @memoize
  get variables() {
    return new IndexedList({
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
  }

  /** Scope `methods`. */
  @memoize
  get methods() {
    return new IndexedList({
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
  }
}
