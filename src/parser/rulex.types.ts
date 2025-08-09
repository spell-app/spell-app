/**
 * Make VSCode hover of `T` more readable.
 * - e.g.:  `Prettify<SomeComplexType>`
 * -  See:  https://www.totaltypescript.com/concepts/the-prettify-helper
 */
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Given string `List`, return type of segments separated by `Delimiter`.
 * - Default Delimiter is `:`
 * - e.g.:  `type Segments = List<"a:b:c">`  // => `type Segments = "a"|"b"|"c"
 */
type SplitString<List, Delimiter extends string = ":"> = List extends `${infer Head}${Delimiter}${infer Tail}`
  ? Head | SplitString<Tail, Delimiter>
  : List
// ALL OF THE BELOW WORK
type s1 = SplitString<"a,b", ",">
type s2 = SplitString<"a" | "b", ",">
// TODO: can we get this to work?
type s3 = SplitString<"a,b\nc", "," | "\n">

/** Given a list of group names separated by `:`, return an object which represents the available groups */
type MatchGroups<GroupString extends string, ValueType = string> = Prettify<
  Partial<{
    [Group in SplitString<GroupString>]: ValueType
  }>
>
// ALL OF THE BELOW WORK
const g1: MatchGroups<"a:b:c"> = { a: "a" }
const g2: MatchGroups<"a" | "b" | "c"> = { a: "a" }
