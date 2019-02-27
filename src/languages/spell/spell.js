import { SpellParser } from "./all.js";

import core from "./core.js";
import _if_ from "./if.js";
import JSX from "./JSX.js";
import lists from "./lists.js";
import operators from "./operators.js";
import statements from "./statements.js";
import types from "./types.js";
import UI from "./UI.js";
import classes from "./classes.js";

// Create parser which combines all of the above...
export const spell = new SpellParser({ module: "spell" });
// Import the other rules defined above.
spell.import(core, operators, types, lists, _if_, statements, JSX, UI, classes);
