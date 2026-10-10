/**
 * The `async` rule module:  async control flow and conceptual "processes" -- `await`, `pause for`, and
 * start/stop/check process.
 * - One rule per file, each registering itself on `_async` (`async.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./async.parser"
export * from "./Await"
export * from "./Pause"
export * from "./StartProcess"
export * from "./StopProcess"
export * from "./CheckProcess"
