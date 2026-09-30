/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["do_something"] } */
import { spellCore, Thing, List, App } from "@spell/core"

/*! SPELL: DECLARES {
  syntax: "do something", output: "do_something", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/1.spell:0-38",
} */
export function do_something() {
  if (1) {
    let it = 100
    /* PARSE ERROR: Don't understand "+ card" */
  }
}
/* PARSE ERROR: Don't understand "print it as lowercase and then do this and do that and do the other thing" */
let it = 2
if (1) { let it_3 = 3 }
/* PARSE ERROR: Got both inline statement and nested block */