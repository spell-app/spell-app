// Core rules composed into a `spellParser` instance.
import { P } from "~/parser"
import { R } from "~/parser/rule"
import { SpellParser } from "~/languages/spell/SpellParser"

// The following add new Rule constructors to `SpellParser.Rule`
import { Block } from "./Block"
import { BlockLine } from "./BlockLine"
import "./Statement"

// The following define "modules" of rule sets, which will be combined below.
import { core } from "./core"
import { types } from "./types"
import { variables } from "./variables"
import { constants } from "./constants"
import { assignment } from "./assignment"
import { expressions } from "./expressions"
import { statements } from "./statements"
import { _if_ } from "./if"
import { JSX } from "./JSX"
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

spellParser.defineRule({ name: "blank_line", constructor: R.BlankLine })
spellParser.defineRule({ name: "block", constructor: Block })
spellParser.defineRule({ name: "line", constructor: BlockLine })
spellParser.defineRule({ name: "parse_error", constructor: ParseError })

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
