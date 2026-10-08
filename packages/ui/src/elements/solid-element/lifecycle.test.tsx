/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 6:  `keepAlive`, `onConnect` / `onDisconnect`, `dispose()`;  the default stays compatible. */

import { createSignal, flush, onCleanup } from "solid-js"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { onConnect, onDisconnect } from "./lifecycle"
import type { SolidElement } from "./solid-element.types"
import { cleanup, mount, nextTag, reproduce, settle } from "./testing"

/** A counter whose state lives in the component:  a click increments it. */
function Counter() {
  const [count, setCount] = createSignal(0)
  return <button onClick={() => setCount((n) => n + 1)}>{count()}</button>
}

/** Click the counter inside `element`. */
function click(element: Element) {
  element.shadowRoot!.querySelector("button")!.click()
  flush()
}

describe("fix 6:  lifecycle", () => {
  afterEach(cleanup)

  reproduce(
    "`keepAlive` keeps component state across a real detach / re-attach (issue #5)",
    async ({ customElement }) => {
      const tag = nextTag("keep-alive")
      customElement(tag, {}, Counter, { keepAlive: true })
      const [left, right] = [mount(), mount()]
      const element = document.createElement(tag)
      left.append(element)
      click(element)
      element.remove()
      await settle()
      right.append(element)
      flush()
      return element.shadowRoot!.textContent
    },
    // released a microtask after disconnect, re-rendered from scratch on reconnect (component-register.js:146-155)
    { original: "0", fork: "1" }
  )

  it("fork, default:  a same-tick move keeps state;  a real detach disposes and re-renders (compatible)", async () => {
    const tag = nextTag("default-lifecycle")
    let cleanups = 0
    customElement(tag, {}, () => {
      onCleanup(() => cleanups++)
      return Counter()
    })
    const [left, right] = [mount(), mount()]
    const element = document.createElement(tag)
    left.append(element)
    click(element)
    right.append(element)
    await settle()
    expect(element.shadowRoot!.textContent).toBe("1")
    expect(cleanups).toBe(0)
    element.remove()
    await settle()
    expect(cleanups).toBe(1)
    left.append(element)
    flush()
    expect(element.shadowRoot!.textContent).toBe("0")
  })

  it("fork, keepAlive:  props flow while detached;  onCleanup runs only on dispose()", async () => {
    const tag = nextTag("detached-props")
    let cleanups = 0
    customElement(
      tag,
      { label: "a" },
      (props) => {
        onCleanup(() => cleanups++)
        return <span>{props.label}</span>
      },
      { keepAlive: true }
    )
    const element = mount(`<${tag}></${tag}>`).firstElementChild as SolidElement & { label: string }
    element.remove()
    await settle()
    element.label = "b"
    flush()
    expect(element.shadowRoot!.textContent).toBe("b")
    expect(cleanups).toBe(0)
    element.dispose()
    element.dispose()
    expect(cleanups).toBe(1)
    expect(element.shadowRoot!.textContent).toBe("")
  })

  it("fork:  onConnect / onDisconnect fire on every connect (the first included) and disconnect", async () => {
    const tag = nextTag("hooks")
    const log: string[] = []
    customElement(
      tag,
      {},
      () => {
        onConnect(() => log.push("connect"))
        onDisconnect(() => log.push("disconnect"))
        return null
      },
      { keepAlive: true }
    )
    const container = mount()
    const element = document.createElement(tag)
    container.append(element)
    element.remove()
    container.append(element)
    await settle()
    expect(log).toEqual(["connect", "disconnect", "connect"])
  })

  it("fork:  hooks registered by a nested component go away with it", async () => {
    const tag = nextTag("nested-hooks")
    const [show, setShow] = createSignal(true)
    const log: string[] = []
    /** Registers a connect hook from a child component. */
    function Child() {
      onConnect(() => log.push("child"))
      return null
    }
    customElement(tag, {}, () => <>{show() ? <Child /> : null}</>, { keepAlive: true })
    const container = mount()
    const element = document.createElement(tag)
    container.append(element)
    setShow(false)
    flush()
    element.remove()
    container.append(element)
    expect(log).toEqual(["child"])
  })
})
