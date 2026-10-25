import { core, App, View, h } from "@spell/core"

core.heading("Counter")
/////////////
// ## Counter
/////////////
// A button that counts its clicks:  the smallest app there is.
// What's where, top to bottom:
//   a counter:  its count, counting up, and its drawing
//   the app:  one counter, drawn
//   start
//   tests

core.heading("A counter -- in the outline style:  its name, then what's true of it")
//////////////////////////////////////////////////////////////////////////
// ## A counter -- in the outline style:  its name, then what's true of it
//////////////////////////////////////////////////////////////////////////
/**
 * A view:  each counter is its own element on the page.
 * The Counter notebook, `@spell/notebooks/Counter`, imports it, and tries it out.
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

  countUp() {
    this.count = this.count + 1
  }

  /** a button saying how many times it's been clicked:  a click counts up */
  draw() {
    return h("ui-button", { onClick: () => this.countUp(), style: "cursor:pointer;user-select:none" },
      "Clicked ",
      () => this.count,
      " times"
    )
  }
}

core.heading("The app:  one counter, drawn")
/** The app:  one counter, drawn */
export class CounterApp extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "counter" is a new counter
  static { this.declareProp("counter", { init: () => new Counter(), early: true }) }
  get counter() { return this.getProp("counter") }
  set counter(value) { this.setProp("counter", value) }

  draw() {
    return h("div", { class: "Counter" }, () => core.drawThing(this.counter))
  }
}
export const counterApp = new CounterApp()

core.heading("Start")
//## Start
if (!core.isCarryingOver) counterApp.start()

core.heading("Tests")
/** Tests */
export function testCounting() {
  return core.test("test counting", function testCounting() {
    core.echoTestAction(`set the counter to a new counter`)
    const counter = new Counter()
    core.expect(counter.count, `the count of the counter`, 0, `0`)
    core.echoTestAction(`count up of the counter`)
    counter.countUp()
    core.echoTestAction(`count up of the counter`)
    counter.countUp()
    core.expect(counter.count, `the count of the counter`, 2, `2`)
  })
}
// -----------
if (!core.isCarryingOver) testCounting()
