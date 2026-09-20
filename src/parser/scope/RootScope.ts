import { IndexedList, typeCase, snakeCase } from "~/util"
import { P } from "~/parser"

import { BlockScope } from "./BlockScope"
/**
 * A `RootScope` is the root scope for a parser -- manages built-in `.rules`, `.types` and `.constants`.
 * - Holds initial set of rules, built-in types, etc. that come with the language, available to
 *   `ProjectScope`s, etc. underneath it.
 */
export class RootScope extends BlockScope {
  /**
   * Named `TypeScope`s known in this scope, keyed by (Type_Case-normalized) name.
   * New entries get wrapped in `TypeScope` and parented here.
   */
  get types(): IndexedList<P.TypeScope, string | P.TypeScope | P.TypeScopeProps> {
    return this.derived(
      "types",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.types",
          normalizeKey: typeCase,
          transformer(item) {
            if (!(item instanceof P.TypeScope)) item = new P.TypeScope(item)
            item.parentScope = this.target
            return item
          }
        })
    )
  }

  /**
   * Named `ScopeConstant`s known in this scope, keyed by (snake_case-normalized) name.
   * New entries get wrapped in `ScopeConstant`.
   */
  get constants(): IndexedList<P.ScopeConstant, string | P.ScopeConstant | P.ScopeConstantProps> {
    return this.derived(
      "constants",
      () =>
        new IndexedList({
          target: this,
          keyProp: "name",
          parentProp: "parentScope.constants",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.ScopeConstant)) item = new P.ScopeConstant(item)
            item.scope = this.target
            return item
          }
        })
    )
  }

  /** Rule definitions added to this scope; each is also defined on the scope's `parser`. */
  get rules(): IndexedList<P.RuleDefinition> {
    return this.derived(
      "rules",
      () =>
        new IndexedList<P.RuleDefinition>({
          target: this,
          keyProp: "name",
          transformer(item) {
            if (item instanceof P.Rule) throw new TypeError(`rules.add(): expected an Object, not a Rule.`)
            if (!this.target.parser) throw new TypeError(`rules.add(): called on scope without a parser.`)
            // Define the rule at the parser level.
            this.target.parser.defineRule({ ...item, scope: this.target })
            return item
          }
        })
    )
  }
}
