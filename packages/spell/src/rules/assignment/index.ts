/**
 * The `assignment` rule module:  assignment and returning values.
 * - One rule per file, each registering itself on `assignment` (`assignment.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./assignment.parser"
export * from "./AssignmentStatement"
export * from "./Get"
export * from "./ReturnStatement"
