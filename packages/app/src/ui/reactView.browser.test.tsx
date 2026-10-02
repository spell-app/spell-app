/** @jsxImportSource react */
import { describe, test, expect, afterEach } from "vitest"
import React from "react"
import { createRoot } from "react-dom/client"

import { Observable, view } from "$/util"

/**
 * The React bridge, `view()` (`$/util`):  compiled spell still draws with React (`Thing.Component`, `List`, spell's
 * forms `F`), and must re-render when the spell cells it read change -- what `easy-state`'s `view()` did.
 */

/** A card, as compiled spell declares one. */
class Card extends Observable {
  static {
    this.declareProp("suit", { type: "text", default: "hearts" })
    this.declareProp("rank", { type: "number", default: 1 })
  }
  get suit(): string {
    return this.getProp("suit")
  }
  set suit(value: string) {
    this.setProp("suit", value)
  }
  get rank(): number {
    return this.getProp("rank")
  }
  set rank(value: number) {
    this.setProp("rank", value)
  }
  get cachedColor(): string {
    return this.derive("cachedColor", function (): string {
      return this.suit === "hearts" || this.suit === "diamonds" ? "red" : "black"
    })
  }
}

/** Renders of each view, by name. */
const renders: Record<string, number> = {}

/** A class component, as `Thing.Component` is. */
const ClassView = view(
  class ClassView extends React.Component<{ card: Card }> {
    render() {
      renders.class = (renders.class ?? 0) + 1
      return (
        <p>
          {this.props.card.rank} of {this.props.card.suit}
        </p>
      )
    }
  }
)

/** A function component, as some of spell's forms are. */
const FunctionView = view(function FunctionView(props: { card: Card }) {
  renders.function = (renders.function ?? 0) + 1
  return <p>{props.card.suit}</p>
})

/** A component reading only a derived value. */
const ColorView = view(function ColorView(props: { card: Card }) {
  renders.color = (renders.color ?? 0) + 1
  return <p>{props.card.cachedColor}</p>
})

/** What each test disposes of. */
const cleanups: Array<() => void> = []
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  for (const name of Object.keys(renders)) delete renders[name]
})

describe("view():  React follows spell cells", () => {
  test("a class component re-renders on a write -- once for several in a row", async () => {
    const card = new Card({ rank: 7 })
    const { host } = await mount(<ClassView card={card} />)
    expect(host.textContent).toBe("7 of hearts")
    card.suit = "spades"
    card.rank = 8
    await settle()
    expect(host.textContent).toBe("8 of spades")
    expect(renders.class).toBe(2)
  })

  test("an `===` write re-renders nothing", async () => {
    const card = new Card({ suit: "clubs" })
    await mount(<ClassView card={card} />)
    card.suit = "clubs"
    await settle()
    expect(renders.class).toBe(1)
  })

  test("a function component too;  it keeps its statics", async () => {
    const card = new Card({})
    const { host } = await mount(<FunctionView card={card} />)
    card.suit = "diamonds"
    await settle()
    expect(host.textContent).toBe("diamonds")
    expect(renders.function).toBe(2)
    expect(FunctionView.name).toBe("FunctionView")
  })

  test("the equality cutoff:  a derived value that didn't change re-renders nothing", async () => {
    const card = new Card({})
    const { host } = await mount(<ColorView card={card} />)
    card.suit = "diamonds" // still red
    await settle()
    expect(renders.color).toBe(1)
    card.suit = "clubs"
    await settle()
    expect(host.textContent).toBe("black")
    expect(renders.color).toBe(2)
  })

  test("unmounted, it stops following", async () => {
    const card = new Card({})
    const { unmount } = await mount(<ClassView card={card} />)
    unmount()
    card.suit = "clubs"
    await settle()
    expect(renders.class).toBe(1)
  })
})

////////////////
// ## Helpers
////////////////

/** Render `element` into a fresh `<div>`, unmounted after the test. */
async function mount(element: React.ReactElement) {
  const host = document.createElement("div")
  document.body.append(host)
  const root = createRoot(host)
  root.render(element)
  let mounted = true
  const unmount = () => {
    if (mounted) root.unmount()
    mounted = false
  }
  cleanups.push(() => {
    unmount()
    host.remove()
  })
  await settle()
  return { host, unmount }
}

/** Let React (and a derived value's microtask check) catch up. */
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 20))
}
