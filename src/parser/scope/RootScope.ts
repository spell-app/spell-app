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

  /**
   * Rules added to this scope while parsing, as `class` + `definition` pairs -- see `P.ScopeRule`.
   * - Written by `Scope.addRule()`, which is what actually registers them on the `parser`.
   * - Kept so the rules a scope created can later be EXPORTED, by re-registering each pair on another scope.
   */
  get rules(): IndexedList<P.ScopeRule> {
    return this.derived("rules", () => new IndexedList<P.ScopeRule>({ target: this, keyProp: "name" }))
  }
}
