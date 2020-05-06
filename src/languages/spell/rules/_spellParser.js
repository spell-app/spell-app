import { SpellParser } from ".."

// The following add new Rule constructors to `SpellParser.Rule`
import "./Block"
import "./Statement"
import "./ParseError"

// The following define "modules" of rule sets, which will be combined below.
import core from "./core"
import types from "./types"
import variables from "./variables"
import constants from "./constants"
import assignment from "./assignment"
import expressions from "./expressions"
import _if_ from "./if"
import JSX from "./JSX"
import lists from "./lists"
import math from "./math"
import properties from "./properties"
import UI from "./UI"
import classes from "./classes"
import tests from "./tests"

// Create parser which combines all of the above...
// NOTE: THIS INSTANCE is used by other parsers, to pick up the rules defined below.
const spellParser = new SpellParser({ module: "spell" })

spellParser.defineRule({ name: "block", constructor: "Block" })
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
  _if_,
  lists,
  UI,
  classes,
  tests,
  JSX
)

export default spellParser
