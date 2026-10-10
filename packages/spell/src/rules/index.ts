/**
 * Assembles every spell language rule module into the single `spellParser` instance.
 * - Not a plain re-export barrel: this folder is a list of independent rule modules, each exporting
 *   its rule classes plus a `SpellParser` which registers them -- this file combines those parsers
 *   via `spellParser.import(...)`.
 * - A module is a folder, one rule per file (`events/`), or still one file (`lists.ts`):
 *   see "Parser rules" in spell's `AGENTS.md`.
 * - NOTE: import order matters in a few places -- see the comment above the `ParseError` import.
 *   Structural rules (`blank_line` / `block` / `line` / `parse_error`) are added directly, below.
 */
import { P } from "$/parser"
import { SpellParser } from "$/spell/SpellParser"

// Structural rule classes, registered directly below.
import { Block, type DocComment } from "./Block"
import { BlockLine, blank_line } from "./BlockLine"
import { commitStatement, SpellStatement } from "./Statement"

// The following define "modules" of rule sets, which will be combined below.
import { core } from "./core"
import { types } from "./types"
import { variables } from "./variables"
import { constants } from "./constants"
import { assignment } from "./assignment"
import { expressions, Negatable } from "./expressions"
import { statements } from "./statements"
import { _if_ } from "./if"
import { JSX, type JSXMatchData } from "./JSX"
import { lists } from "./lists"
import { math } from "./math"
import { properties } from "./properties"
import { events } from "./events"
import { UI } from "./UI"
import { classes } from "./classes"
import { methods } from "./methods"
import { _async } from "./async"
import { draw } from "./draw"
import { tests } from "./tests"

// NOTE: kept as the last import (matching the original `export { ParseError } from "./ParseError"`
// placement, which was hoisted to evaluate after all the modules above) since `ParseError.ts`'s own
// evaluation order relative to the other rule modules is load-bearing.
import { ParseError } from "./ParseError"

/**
 * All core spell rules combined into a `SpellParser` instance.
 */
export const spellParser = new SpellParser({ module: "spell" })

/**
 * Parse a spell "expression" with the default parser.
 */
export const parseExpression = (expression: string | P.Token | P.Token[], scope?: P.Scope) => {
  return spellParser.parse(expression, "expression", scope)
}

/** Export ParseError so we can create them programmatically. */
export { ParseError }
/** Export so a translation can register its own negatable words -- see `Negatable`. */
export { Negatable }
/** Export so callers can get at parse errors collected on a `block` / `line` match. */
export { type DocComment }
/** Export so anything which parses a statement on its own can lock it in, e.g. `SpellParser.commit()`. */
export { commitStatement }
/**
 * Export so editors can map a call's expression twin to its statement rule
 * -- see `SpellStatement.statementRuleOf()`.
 */
export { SpellStatement }
/** Export so `SpellParser`'s incremental parsing hooks can narrow to them. */
export { Block, BlockLine }

/** `JSX.ts`'s `match.data` shape for `jsxElement`/`jsxAttribute`/`jsxExpression` matches -- e.g. for UI code that reads them. */
export type { JSXMatchData }

// Structural rules.  The last three set `static ruleName` since their class names are `Type_Case`, not rule case.
spellParser.addRule(blank_line)
spellParser.addRule(Block)
spellParser.addRule(BlockLine)
spellParser.addRule(ParseError)

// Import the other rules defined above.
spellParser.import(
  core,
  types,
  variables,
  constants,
  assignment,
  expressions,
  statements,
  math,
  properties,
  events,
  _if_,
  lists,
  UI,
  classes,
  methods,
  _async,
  tests,
  draw,
  JSX
)
