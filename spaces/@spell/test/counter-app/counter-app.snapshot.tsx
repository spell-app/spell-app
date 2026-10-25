import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, prop, drawn } from "@spell/core"
import { Counter } from "@spell/project/@spell/test/counter"

core.heading("A counter app:  a counter from another project, made and drawn")
////////////////////////////////////////////////////////////////////
// ## A counter app:  a counter from another project, made and drawn
////////////////////////////////////////////////////////////////////
/** Its counter is the frozen counter library's (`@spell/test/counter`), which its project file imports. */
export class Tally extends App {
  // - its "counter" is a new counter
  @prop({ init: () => new Counter(), early: true })
  accessor counter!: Counter

  // the counter draws itself:  a button showing its count
  @drawn draw() {
    return <div class="Tally">{core.drawThing(this.counter)}</div>
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
