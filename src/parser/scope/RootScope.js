import { memoize, IndexedList, typeCase, snakeCase } from "~/util"
import { Rule, TypeScope, ScopeConstant } from "~/parser"
import { BlockScope } from "./BlockScope"
/**
 * A `RootScope` is the root scope for a parser.
 * It manages built-in `.rules`, `.types` and `.constants`,
 *
 * This gets the initial set of rules, built-in types, etc that come with the language.
 * which are available to `ProjectScope`s, etc underneath it.
 */
export class RootScope extends BlockScope {
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
