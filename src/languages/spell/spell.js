import { SpellParser } from "./SpellParser.js";

import core from "./core.js";
import statement from "./statement.js";
import assignment from "./assignment.js";
import _if_ from "./if.js";
import JSX from "./JSX.js";
import lists from "./lists.js";
import operators from "./operators.js";
import math from "./math.js";
import types from "./types.js";
import UI from "./UI.js";
import classes from "./classes.js";

// Create parser which combines all of the above...
export const spell = new SpellParser({ module: "spell" });
// Import the other rules defined above.
spell.import(core, statement, assignment, operators, math, types, lists, _if_, JSX, UI, classes);
