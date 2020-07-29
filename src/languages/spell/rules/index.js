// Core rules composed into a `spellParser` instance.
import { Rule } from "~/parser"
import { SpellParser } from ".."

// The following add new Rule constructors to `SpellParser.Rule`
import "./Block"
import "./BlockLine"
import "./Statement"
import "./ParseError"

// The following define "modules" of rule sets, which will be combined below.
import { core } from "./core"
import { types } from "./types"
import { variables } from "./variables"
import { constants } from "./constants"
import { assignment } from "./assignment"
import { expressions } from "./expressions"
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

/**
 * All core spell rules combined into a `SpellParser` instance.
 */
export const spellParser = new SpellParser({ module: "spell" })

spellParser.defineRule({ name: "blank_line", constructor: Rule.BlankLine })
spellParser.defineRule({ name: "block", constructor: "Block" })
spellParser.defineRule({ name: "line", constructor: "BlockLine" })
spellParser.defineRule({ name: "parse_error", constructor: "ParseError" })

// Import the other rules defined above.
spellParser.import(
  core,
  types,
  variables,
  constants,
  assignment,
  expressions,
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
