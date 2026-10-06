/**
 * Constants of the `ui-progress` family that its element (`UIProgress`), its arithmetic (`ProgressValues`) and its
 * native fallback share.
 * - Pure data, at the bottom of the folder's imports:  no imports at all, so node can load it (`yarn site:data`).
 * - Constants only one class reads live below that class (epic `wwod-spell-ui`, Q18);  `ProgressValuesProps` lives
 *   with `ProgressValues` (WWOD §9 › "Props types live with their class").
 */

////////////////
// ## Lists
////////////////

/** What separates the items of a list attribute (`value`, `percent`, `bar-colors`):  commas and / or spaces. */
export const LIST_SPLIT = /[\s,]+/
