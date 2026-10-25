import { core, View, prop, thing, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("A counter -- in the outline style:  its name, then what's true of it")
//////////////////////////////////////////////////////////////////////////
// ## A counter -- in the outline style:  its name, then what's true of it
//////////////////////////////////////////////////////////////////////////
/**
 * A library other projects import:  `counter-app` makes one and draws it.
 * A view:  each counter is its own element on the page, e.g. `<counter-counter>`.
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

  increment() {
    this.count = this.count + 1
  }

  //## drawing:  a button showing its count;  a click counts
  @drawn draw() {
    return (
      <ui-button class="Counter" onClick={() => this.increment()} style="cursor:pointer;user-select:none">
        {`Count: ${this.count}`}
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

  increment() {
    return this.currentThing?.increment()
  }
}
core.useElement(Counter, CounterElement)

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

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CounterElement` */
      "test-project-counter": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
