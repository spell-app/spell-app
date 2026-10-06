/**
 * Constants of the `ui-statistic` family that its element (`UIStatistic`) and its native fallback (`StatisticFallback`)
 * share.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - The shorthands' static owner class (`in-statistic`) is built where it's used, from the vocabulary's noun:  a
 *   types file imports its vocabularies as types only (`test/vocabularies.test.ts`).
 */

////////////////
// ## Shorthands
////////////////

/** The `value` shorthand:  its attribute, part noun and class word. */
export const VALUE = "value"
