import { SpellParser } from "./SpellParser.js";

import { Block } from "./Block.js";
import { BlockLine } from "./BlockLine.js";

import core from "./core.js";
import assignment from "./assignment.js";
import _if_ from "./if.js";
import JSX from "./JSX.js";
import lists from "./lists.js";
import expressions from "./expressions.js";
import math from "./math.js";
import types from "./types.js";
import UI from "./UI.js";
import classes from "./classes.js";

// Create parser which combines all of the above...
export const spell = new SpellParser({ module: "spell" });

spell.defineRule({ name: "block", constructor: Block });
spell.defineRule({ name: "block_line", constructor: BlockLine });

// Import the other rules defined above.
spell.import(core, assignment, expressions, math, types, lists, _if_, JSX, UI, classes);
