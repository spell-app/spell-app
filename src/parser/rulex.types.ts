import type { Prettify, SplitString } from "~/types.ts"

/** Given a list of group names separated by `:`, return an object which represents the available groups. */
type MatchGroups<GroupString extends string, ValueType = string> = Prettify<
  Partial<{
    [Group in SplitString<GroupString>]: ValueType
  }>
>
// ALL OF THE BELOW WORK
const g1: MatchGroups<"a:b:c"> = { a: "a" }
const g2: MatchGroups<"a" | "b" | "c"> = { a: "a" }
