/**
 * The `lists` rule module:  rules for dealing with lists -- literals, membership, indexing, in-place mutation,
 * iteration.
 * - NOTE: several rules capture a `{arg:singular_identifier}`/`{arg:plural_identifier}` classifier noun
 *   (e.g. `card`, `items`) that's matched for readability only and never read back out of `match.groups`.
 * - One rule per file, each registering itself on `lists` (`lists.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 * TODO: sort
 */
export * from "./lists.parser"
export * from "./lists.shared"
export * from "./IdentifierList"
export * from "./NumberRange"
export * from "./ValueChoices"
export * from "./BracketedList"
export * from "./CopyList"
export * from "./MergeLists"
export * from "./ListLength"
export * from "./ListCount"
export * from "./ListPosition"
export * from "./StartsWith"
export * from "./EndsWith"
export * from "./Ordinal"
export * from "./ListItemExpression"
export * from "./PositionExpression"
export * from "./OrdinalPositionExpression"
export * from "./RandomItemExpression"
export * from "./RandomItemsExpression"
export * from "./RangeBetweenExpression"
export * from "./RangeStartingWithExpression"
export * from "./RangeCountExpression"
export * from "./ListFilter"
export * from "./ListMembershipTest"
// Adding to list (in-place)
export * from "./ListAdd"
export * from "./ListPrepend"
export * from "./ListAppend"
// Add to middle of list, pushing existing items out of the way
export * from "./ListAddRelative"
// Removing from list (in-place)
export * from "./ListEmpty"
export * from "./ListRemoveOrdinal"
export * from "./ListRemovePosition"
export * from "./ListRemoveRange"
export * from "./ListRemoveRangeOrdinal"
export * from "./ListRemove"
export * from "./ListRemoveWhere"
// Moving between lists -- their guards
export * from "./ListMove"
export * from "./CanTake"
export * from "./CanGiveUp"
// Random (in-place) list manipulation
export * from "./ListReverse"
export * from "./ListShuffle"
export * from "./RepeatNTimes"
export * from "./ListIteration"
export * from "./ListRangeIteration"

// WORKING FROM OTHER RULES (testme)
//  `the length of <list>`
//  `<thing> is not? in <list>`
//  `<list> is not? empty`
//  `set item 1 of my-list to 'a'`

// TODO:   `create list with <exp>, <exp>, <exp>`
// TODO:  `duplicate list`
// TODO:  `duplicate list with <exp>, <exp>, <exp>` ???
// TODO:  `the size of <list>` => will map to `list.size`...
//        - install `size` as an alias to `length`?
// TODO:  `move <thing> to end of <list>` ???
// TODO:  `Set` for a unique list?
// TODO:  list which won't take null/undefined
