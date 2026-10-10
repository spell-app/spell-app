/**
 * The `tests` rule module:  inline spell tests -- `expect`/`start test`/`end test`/`echo`, used to write assertions and
 * debug output directly in spell source rather than in a separate test language.
 * - One rule per file, each registering itself on `tests` (`tests.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./tests.parser"
export * from "./ExpectTest"
export * from "./StartTest"
export * from "./EndTest"
export * from "./Echo"
