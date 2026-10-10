import { spellCore, Thing, List, App } from "@spell/core"

export function doSomething() {
  if (1) {
    const it = 100
    /* PARSE ERROR: Don't understand "+ card" */
  }
}
/* PARSE ERROR: Don't understand "print it as lowercase and then do this and do that and do the other thing" */
const it = 2
if (1) { const it3 = 3 }
/* PARSE ERROR: Got both inline statement and nested block */