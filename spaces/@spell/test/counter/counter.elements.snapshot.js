import { core, View, h, sendCall } from "@spell/core"

//////////////////////////////////////////////////////////////////////////
// ## A counter -- in the outline style:  its name, then what's true of it
//////////////////////////////////////////////////////////////////////////
/**
 * A library other projects import:  `counter-app` makes one and draws it.
 * A view:  each counter is its own element on the page, e.g. `<counter-counter>`.
 */
export class Counter extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "count" is a number
  static { this.declareProp("count", { type: "number" }) }
  get count() { return this.getProp("count") }
  set count(value) { this.setProp("count", value) }

  /** a new counter starts at 0 */
  create() {
    this.count = 0
  }

  increment() {
    this.count = this.count + 1
  }

  //## drawing:  a button showing its count;  a click counts
  draw() {
    return h("ui-button", {
      class: "Counter",
      onClick: () => sendCall("increment", [], this),
      style: "cursor:pointer;user-select:none"
    }, () => `Count: ${this.count}`)
  }
}

/** Tests */
export function testCounting(...args) {
  return sendCall("test_counting", args)
}
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {

}

