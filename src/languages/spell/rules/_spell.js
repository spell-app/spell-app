import { Spell } from "../all.js";

// These following add new Rule constructors to `Spell.Rule`
import "./Block.js"
import "./BlockLine.js"
import "./Statement.js"
import "./ParseError.js"

// The following define "modules" of rule sets, which will be combined below.
import core from "./core.js";
import types from "./types.js";
import variables from "./variables.js";
import constants from "./constants.js";
import assignment from "./assignment.js";
import _if_ from "./if.js";
import JSX from "./JSX.js";
import lists from "./lists.js";
import expressions from "./expressions.js";
import math from "./math.js";
import properties from "./properties.js";
import UI from "./UI.js";
import classes from "./classes.js";
import tests from "./tests.js";

// Create parser which combines all of the above...
export const spellParser = new Spell.Parser({ module: "spell" });

spellParser.defineRule({ name: "block", constructor: Spell.Rule.Block });
spellParser.defineRule({ name: "block_line", constructor: Spell.Rule.BlockLine });
spellParser.defineRule({ name: "parse_error", constructor: Spell.Rule.ParseError });

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
);
