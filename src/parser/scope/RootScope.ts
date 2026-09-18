import { IndexedList, typeCase, snakeCase } from "~/util"
import { Rule } from "~/parser"
import type { P } from "~/parser"
import { BlockScope } from "./BlockScope"
import { TypeScope, ScopeConstant } from "."
/**
 * A `RootScope` is the root scope for a parser.
 * It manages built-in `.rules`, `.types` and `.constants`,
 *
 * This gets the initial set of rules, built-in types, etc that come with the language.
 * which are available to `ProjectScope`s, etc underneath it.
 */
export class RootScope extends BlockScope {
  /** Scope `types`. */
  get types(): IndexedList<TypeScope, string | TypeScope | P.TypeScopeProps> {
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
  get constants(): IndexedList<ScopeConstant, string | ScopeConstant | P.ScopeConstantProps> {
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
  /** Rule definitions added to this scope; each is also defined on the scope's `parser`. */
  get rules(): IndexedList<P.RuleDefinition> {
    return this.derived(
      "rules",
      () =>
        new IndexedList<P.RuleDefinition>({
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
