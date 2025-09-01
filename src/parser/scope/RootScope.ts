import { IndexedList, typeCase, snakeCase } from "~/util"
import { Rule } from "~/parser/rule/Rule"
import { BlockScope } from "./BlockScope"
import { TypeScope, ScopeConstant, type ScopeConstantProps } from "."
/**
 * A `RootScope` is the root scope for a parser.
 * It manages built-in `.rules`, `.types` and `.constants`,
 *
 * This gets the initial set of rules, built-in types, etc that come with the language.
 * which are available to `ProjectScope`s, etc underneath it.
 */
export class RootScope extends BlockScope {
  /** Scope `types`. */
  get types(): IndexedList<TypeScope, TypeScope> {
    return this.derived(
      "types",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.types",
          normalizeKey: typeCase,
          transformer(item) {
            if (!(item instanceof TypeScope)) item = new TypeScope(item)
            item.parentScope = this.target
            return item
          }
        })
    )
  }

  /** Scope `constants`. */
  get constants(): IndexedList<ScopeConstant, string | ScopeConstant | ScopeConstantProps> {
    return this.derived(
      "constants",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.constants",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof ScopeConstant)) item = new ScopeConstant(item)
            item.scope = this.target
            return item
          }
        })
    )
  }

  /** Scope `rules`. */
  get rules(): IndexedList<Rule, Rule> {
    return this.derived(
      "rules",
      () =>
        new IndexedList({
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
    )
  }
}
