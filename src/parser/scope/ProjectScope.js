import { Rule, memoize, IndexedList, typeCase, snakeCase } from ".."
import { BlockScope, TypeScope, ScopeConstant } from "."
/**
 * A `ProjectScope` manages a set of `FileScope`s.
 * It manages `.types`, `.constants` and `.rules`, which are shared with the `FileScope`s.
 */
export class ProjectScope extends BlockScope {
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
        item.scope = this.target
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
        item.scope = this.target
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
      transformer(item) {
        if (item instanceof Rule) throw new TypeError(`rules.add(): expected an Object, not a Rule.`)
        if (!this.target.parser) throw new TypeError(`rules.add(): called on scope without a parser.`)
        // Define the rule at the parser level.
        this.target.parser.defineRule({ ...item, scope: this.target })
        return item
      }
    })
  }
}
