import type { Prettify, SplitString } from "~/types"
import type { Match } from "~/parser/Match"

/**
 * Given a list of group names separated by `:`, return an object type for `match.groups`.
 * - e.g. `Match<RulexGroups<"lhs:rhs">>` gives `groups: { lhs?: Match; rhs?: Match }`
 * - Pass `ValueType` to override, e.g. `RulexGroups<"items", Match[]>` for repeated groups.
 */
export type RulexGroups<GroupString extends string, ValueType = Match> = Prettify<
  Partial<{
    [Group in SplitString<GroupString>]: ValueType
  }>
>
