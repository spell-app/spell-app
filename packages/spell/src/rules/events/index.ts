/**
 * The `events` rule module:  firing and watching global events -- `trigger`/`fire`/`send` and `on`.
 * - They compile to core's `spellCore.trigger()` / `spellCore.on()`,
 *   which find the program's CURRENT runtime when called:  a new one is made each time a program starts.
 * - One rule per file, each registering itself on `events` (`events.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./events.parser"
export * from "./Trigger"
export * from "./On"
