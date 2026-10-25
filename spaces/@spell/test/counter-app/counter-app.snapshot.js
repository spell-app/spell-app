import { core, App, h } from "@spell/core"
import { Counter } from "@spell/project/@spell/test/counter"

core.heading("A counter app:  a counter from another project, made and drawn")
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
export const tally = new Tally()

core.heading("Tests")
/** Tests */
export function testTheImportedCounter() {
  return core.test("test the imported counter", function testTheImportedCounter() {
    core.echoTestAction(`set the counter to a new counter`)
    const counter = new Counter()
    core.expect(counter.count, `the count of the counter`, 0, `0`)
    core.echoTestAction(`increment the counter`)
    counter.increment()
    core.expect(counter.count, `the count of the counter`, 1, `1`)
  })
}

core.heading("Start")
//## Start
if (!core.isCarryingOver) tally.start()
// -----------
if (!core.isCarryingOver) testTheImportedCounter()
