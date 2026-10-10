/**
 * The `draw` rule module:  draw utilities, tightly tied into `App`, `Drawable` and `List`.
 * - One rule per file, each registering itself on `draw` (`draw.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./draw.parser"
export * from "./DrawThing"
export * from "./DrawItems"
export * from "./StartApp"
