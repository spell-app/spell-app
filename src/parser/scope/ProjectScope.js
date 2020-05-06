import { memoize, IndexedList, typeCase, snakeCase } from ".."
import { Scope, TypeScope, ScopeConstant } from "."
/**
 * `Project` scope.
 * TODOC:  Manages parsing a bunch of `Files` with an explicit load order.
 *
 * `Project` scopes define `types` and `constants` which are shared by all files in the project.
 */
export class ProjectScope extends Scope {
  /** Scope `types`. */
  @memoize
  get types() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.types",
      normalizeKey: typeCase,
      transformer(item) {
        if (!(item instanceof TypeScope)) item = new TypeScope(item)
        item.scope = this
        return item
      }
    })
  }

  /** Scope `constants`. */
  @memoize
  get constants() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.constants",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof ScopeConstant)) item = new ScopeConstant(item)
        item.scope = this
        return item
      }
    })
  }

  /** Scope `rules`. */
  @memoize
  get rules() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.rules",
      transformer(item) {
        return { ...item, scope: this.target }
      }
    })
  }
}
