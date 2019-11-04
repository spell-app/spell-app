import { Spell } from "../all"

// The following add new Rule constructors to `Spell.Rule`
import "./Block"
import "./BlockLine"
import "./Statement"
import "./ParseError"

// The following define "modules" of rule sets, which will be combined below.
import core from "./core"
import types from "./types"
import variables from "./variables"
import constants from "./constants"
import assignment from "./assignment"
import _if_ from "./if"
import JSX from "./JSX"
import lists from "./lists"
import expressions from "./expressions"
import math from "./math"
import properties from "./properties"
import UI from "./UI"
import classes from "./classes"
import tests from "./tests"

// Create parser which combines all of the above...
// NOTE: THIS INSTANCE is used by other parsers, to pick up the rules defined below.
const spellParser = new Spell.Parser({ module: "spell" })

spellParser.defineRule({ name: "block", constructor: Spell.Rule.Block })
spellParser.defineRule({ name: "block_line", constructor: Spell.Rule.BlockLine })
spellParser.defineRule({ name: "parse_error", constructor: Spell.Rule.ParseError })

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
  lists,
  _if_,
  JSX,
  UI,
  classes,
  tests
)

export default spellParser
