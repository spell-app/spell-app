/**
 * The constants of the progress family:  the ones its component (`UIProgress`)
 * and its arithmetic (`ProgressValues`) share.
 * - Pure data, at the bottom of the folder's imports:  it imports nothing, so node can load it (`yarn site:data`).
 * - A constant only one class reads lives below that class (epic `wwod-spell-ui`, Q18);
 *   `ProgressValuesProps` lives with `ProgressValues` (WWOD §9 › "Props types live with their class").
 */

////////////////
// ## Lists
////////////////

/** What separates the items of a list attribute (`value`, `percent`, `bar-colors`):  commas and / or spaces. */
export const LIST_SPLIT = /[\s,]+/
