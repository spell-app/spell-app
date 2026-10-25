import { core, App, prop, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"
import { Counter } from "@spell/project/@spell/test/counter"

core.heading("A counter app:  a counter from another project, made and drawn")
////////////////////////////////////////////////////////////////////
// ## A counter app:  a counter from another project, made and drawn
////////////////////////////////////////////////////////////////////
/** Its counter is the frozen counter library's (`@spell/test/counter`), which its project file imports. */
export class Tally extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "counter" is a new counter
  @prop({ init: () => new Counter(), early: true })
  accessor counter!: Counter

  // the counter draws itself:  a button showing its count
  @drawn draw() {
    return <div class="Tally">{core.drawThing(this.counter)}</div>
  }
}

/**
 * `<test-project-app>`:  a tally, drawn in its own element, e.g. by `draw the tally`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its tally's properties;  its methods call its tally's.
 * - What every view's element does, e.g. drawing its tally, is `SpellElement`'s.
 */
export class TallyElement extends SpellElement<Tally> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "tally", [
    { name: "counter", kind: "json", description: "Its counter." }
  ])
}
core.useElement(Tally, TallyElement)
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

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `TallyElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
