import { core, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

core.heading("A counter -- in the outline style:  its name, then what's true of it")
//////////////////////////////////////////////////////////////////////////
// ## A counter -- in the outline style:  its name, then what's true of it
//////////////////////////////////////////////////////////////////////////
/**
 * A library other projects import:  `counter-app` makes one and draws it.
 * A drawable thing:  each counter is its own element on the page, e.g. `<counter-counter>`.
 */
export class Counter extends Drawable {
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
    return h("ui-button", { class: "Counter", onClick: () => this.increment(), style: "cursor:pointer;user-select:none" },
      () => `Count: ${this.count}`
    )
  }
}

core.heading("Tests")
/** Tests */
export function testCounting() {
  return core.test("test counting", function testCounting() {
    core.echoTestAction(`get a new counter`)
    const it = new Counter()
    core.expect(it.count, `its count`, 0, `0`)
    core.echoTestAction(`increment it`)
    it.increment()
    core.echoTestAction(`increment it`)
    it.increment()
    core.expect(it.count, `its count`, 2, `2`)
  })
}
// -----------
if (!core.isCarryingOver) testCounting()
