/**
 * Master import file for spell language.
 * - All other files MUST only import from here (or a direct peer file) -- reaching into a leaf file from
 *   outside `~/languages/spell` risks circular import problems.
 * - NOTE: this barrel is also pulled into the server -- `src/server/project-utils.ts` does
 *   `import { SP } from "~/languages/spell"` and calls `SP.SpellLocation...` / `SP.spellParser.compile()`
 *   directly.  Nothing reachable from here can rely on browser-only globals at module-evaluation time
 *   (methods that only run client-side, e.g. `SpellFile.executeCompiled()`'s `document` use, are fine --
 *   the server just never calls them).
 */

/**
 * All SpellParser code as `SP` barrel.
 * - Prefer importing as `import { SP } from "~/languages/spell"` when possible.
 */
export * as SP from "."

export * from "./spell.types"

export * from "./SpellLocation"
export * from "./SpellProjectRoot"
export * from "./SpellProject"
export * from "./SpellFile"
export * from "./SpellJSFile"
export * from "./SpellCSSFile"
export * from "./SpellSetup"
export * from "./SpellParser"

/**
 * `spellParser`: shared `SpellParser` instance with spell's "core" rules already applied -- start here if
 * you need the language's default parser.  Also re-exports `ParseError` (fallback "couldn't parse this"
 * rule) and `parseExpression()` (parse a bare expression string).
 */
export { spellParser, ParseError, getParseErrors, parseExpression, type JSXMatchData } from "./rules"
