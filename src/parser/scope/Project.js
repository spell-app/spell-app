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

  /**
   * Return the named type.  If not found, create a `stub` type.
   * TODO: this seems dangerous...
   */
  getOrStubType(name) {
    return this.types.get(name) || this.types.add({ name, stub: true })
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
}
Scope.Project = Project
