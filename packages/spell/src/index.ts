/**
 * Master import file for spell language.
 * - All other files MUST only import from here (or a direct peer file) -- reaching into a leaf file from
 *   outside `$/spell` risks circular import problems.
 * - NOTE: this barrel is also pulled into the server -- `src/server/project-utils.ts` does
 *   `import { SP } from "$/spell"` and calls `SP.SpellLocation...` / `SP.spellParser.compile()`
 *   directly.  Nothing reachable from here can rely on browser-only globals at module-evaluation time
 *   (methods that only run client-side are fine -- the server just never calls them).
 * - NOTE: nothing here imports `spellCore`'s code -- only its types file.  Programs run on a runner's own copy of
 *   it, see `spellRuntime.ts`, so a second copy here would be one no program runs on.
 */

/**
 * All SpellParser code as `SP` barrel.
 * - Prefer importing as `import { SP } from "$/spell"` when possible.
 */
export * as SP from "./"

export * from "./spell.types"

export * from "./SpellLocation"
export * from "./SpellProjectRoot"
export * from "./SpellProject"
export * from "./SpellFile"
export * from "./SpellJSFile"
export * from "./SpellCSSFile"
export * from "./SpellSetup"
export * from "./SpellParser"
export * from "./builtinTypes"

/**
 * `spellParser`: shared `SpellParser` instance with spell's "core" rules already applied -- start here if
 * you need the language's default parser.  Also re-exports `ParseError` (fallback "couldn't parse this"
 * rule) and `parseExpression()` (parse a bare expression string).
 */
export {
  spellParser,
  ParseError,
  type DocComment,
  commitStatement,
  SpellStatement,
  Block,
  BlockLine,
  parseExpression,
  Negatable,
  type JSXMatchData
} from "./rules"

export * from "./SpellDeclarations"
export * from "./hoistClassMembers"
export * from "./targets"
export * from "./highlight"
