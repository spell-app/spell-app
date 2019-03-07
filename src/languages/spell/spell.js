import { SpellParser } from "./SpellParser.js";

import { Block } from "./Block.js";
import { BlockLine } from "./BlockLine.js";

import core from "./rules/core.js";
import assignment from "./rules/assignment.js";
import _if_ from "./rules/if.js";
import JSX from "./rules/JSX.js";
import lists from "./rules/lists.js";
import expressions from "./rules/expressions.js";
import math from "./rules/math.js";
import types from "./rules/types.js";
import UI from "./rules/UI.js";
import classes from "./rules/classes.js";

// Create parser which combines all of the above...
export const spell = new SpellParser({ module: "spell" });

spell.defineRule({ name: "block", constructor: Block });
spell.defineRule({ name: "block_line", constructor: BlockLine });

// Import the other rules defined above.
spell.import(core, assignment, expressions, math, types, lists, _if_, JSX, UI, classes);
