import { core, App, h, sendCall } from "@spell/core"
import { Counter } from "@spell/project/@spell/test/counter"

////////////////////////////////////////////////////////////////////
// ## A counter app:  a counter from another project, made and drawn
////////////////////////////////////////////////////////////////////
/** Its counter is the frozen counter library's (`@spell/test/counter`), which its project file imports. */
export class Tally extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "counter" is a new counter
  static { this.declareProp("counter", { init: () => new Counter(), early: true }) }
  get counter() { return this.getProp("counter") }
  set counter(value) { this.setProp("counter", value) }

  // the counter draws itself:  a button showing its count
  draw() {
    return h("div", { class: "Tally" }, () => core.drawThing(this.counter))
  }
}
export let tally

/** Tests */
export function testTheImportedCounter(...args) {
  return sendCall("test_the_imported_counter", args)
}

//## Start
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  tally = state["tally"]
}

