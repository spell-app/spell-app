/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** Solid 2 traps the fork hides by default:  owned-scope writes through element properties, tracked setup. */

import { createSignal, flush } from "solid-js"
import { render } from "@solidjs/web"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { cleanup, mount, nextTag, reproduce } from "./testing"

describe("Solid 2 traps", () => {
  afterEach(cleanup)

  reproduce(
    "setting an element property from inside a Solid component body is allowed (it's a DOM API)",
    ({ customElement }) => {
      const tag = nextTag("owned-write")
      customElement(tag, { label: "a" }, (props: { label: string }) => <span>{props.label}</span>)
      const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { label: string }
      /** An app component that configures an existing element while rendering. */
      function App() {
        element.label = "from a component body"
        return null
      }
      const root = mount()
      try {
        render(() => <App />, root)
      } catch (error) {
        return String(error).includes("owned scope") ? "throws" : String(error)
      }
      flush()
      return element.shadowRoot!.textContent
    },
    // the prop signal is written inside the app's owner:  `REACTIVE_WRITE_IN_OWNED_SCOPE` in dev
    { original: "throws", fork: "from a component body" }
  )

  it("fork:  the component body runs untracked (once), even inside the error boundary", () => {
    const tag = nextTag("untracked")
    const [outside, setOutside] = createSignal(0)
    let runs = 0
    customElement(tag, { label: "a" }, (props) => {
      runs++
      // reads in the body would re-run the whole component if it were tracked
      void props.label
      void outside()
      return <span>{props.label}</span>
    })
    const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { label: string }
    element.label = "b"
    setOutside(1)
    flush()
    expect(runs).toBe(1)
    expect(element.shadowRoot!.textContent).toBe("b")
  })

  it("fork:  `onError` may write signals (it runs outside any owner)", () => {
    const tag = nextTag("error-write")
    const [message, setMessage] = createSignal("")
    customElement(
      tag,
      {},
      () => {
        throw new Error("bad")
      },
      { onError: (_element, error) => setMessage((error as Error).message) }
    )
    mount(`<${tag}></${tag}>`)
    flush()
    expect(message()).toBe("bad")
  })
})
