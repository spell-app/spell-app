import { core, App, View, prop, thing, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

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
@thing
export class Counter extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "count" is a number
  @prop({ type: "number" })
  accessor count!: number

  /** a new counter starts at 0 */
  create() {
    this.count = 0
  }

  countUp() {
    this.count = this.count + 1
  }

  /** a button saying how many times it's been clicked:  a click counts up */
  @drawn draw() {
    return (
      <ui-button onClick={() => this.countUp()} style="cursor:pointer;user-select:none">
        {"Clicked "}
        {this.count}
        {" times"}
      </ui-button>
    )
  }
}

/**
 * `<test-project-counter>`:  a counter, drawn in its own element, e.g. by `draw the counter`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its counter's properties;  its methods call its counter's.
 * - What every view's element does, e.g. drawing its counter, is `SpellElement`'s.
 */
export class CounterElement extends SpellElement<Counter> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-counter", "counter", [
    { name: "count", kind: "number", description: "Its count." }
  ])

  create() {
    return this.currentThing?.create()
  }

  countUp() {
    return this.currentThing?.countUp()
  }
}
core.useElement(Counter, CounterElement)

core.heading("The app:  one counter, drawn")
/** The app:  one counter, drawn */
export class CounterApp extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "counter" is a new counter
  @prop({ init: () => new Counter(), early: true })
  accessor counter!: Counter

  @drawn draw() {
    return <div class="Counter">{core.drawThing(this.counter)}</div>
  }
}

/**
 * `<test-project-app>`:  a counter app, drawn in its own element, e.g. by `draw the counter app`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its counter app's properties;  its methods call its counter app's.
 * - What every view's element does, e.g. drawing its counter app, is `SpellElement`'s.
 */
export class CounterAppElement extends SpellElement<CounterApp> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "counter app", [
    { name: "counter", kind: "json", description: "Its counter." }
  ])
}
core.useElement(CounterApp, CounterAppElement)
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

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CounterElement` */
      "test-project-counter": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `CounterAppElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
