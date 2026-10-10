import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellExpression } from "$/spell/rules/expressions"

/**
 * Base for rules which pick ONE item out of a list, e.g. `the first card of the deck`:  what we are is an item of it.
 * - Notes what the list holds WHILE PARSING, into `data.itemType`, e.g. `Card` for `the deck`.
 * - Why then:  it's a scope lookup -- a `Deck`'s item type is on its `TypeScope` -- and `getDatatype()` mustn't look.
 */
export class ListItemExpression<Groups extends string | P.AnyGroups = P.AnyGroups> extends SpellExpression<
  Groups,
  ListItemData
> {
  /** Group holding the list, e.g. `list` in `a random {arg} of {list}`. */
  declare listGroup: string
  @proto static listGroup = "list"

  /** Note what the list holds, while we can look it up -- see class docs. */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens)
    const list = match?.groups[this.listGroup] as P.Match | undefined
    if (match && list) (match.data as ListItemData).itemType = scope.getItemType(list.datatype)
    return match
  }
  /** An item of the list, e.g. `Card` for `the first card of the deck`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.itemType
  }
}

/** What a `ListItemExpression` stashes on its match. */
type ListItemData = {
  /** What the list holds, e.g. `Card`, looked up while parsing -- `undefined` if unknown. */
  itemType?: P.Datatype
}
