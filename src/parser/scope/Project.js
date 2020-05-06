import { memoize, IndexedList, typeCase, snakeCase, Scope, Constant, Type } from ".."

/**
 * `Project` scope.
 * TODOC:  Manages parsing a bunch of `Files` with an explicit load order.
 *
 * `Project` scopes define `types` and `constants` which are shared by all files in the project.
 */
export default class Project extends Scope {
  /** Scope `types`. */
  @memoize
  get types() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.types",
      normalizeKey: typeCase,
      transformer(item) {
        if (!(item instanceof Type)) item = new Type(item)
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
        if (!(item instanceof Constant)) item = new Constant(item)
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
Scope.Project = Project
