/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 7:  an error boundary per element, `onError`, `fallback`, `errorEvent`, `:state(errored)`. */

import { createMemo, flush, resetErrorHalt } from "solid-js"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { customElement } from "./customElement"
import { IMPLEMENTATIONS, cleanup, mount, nextTag, reproduce, type Implementation } from "./testing"

/** Props of the test elements. */
type BoomProps = { boom: boolean; label: string }

/** A component that throws from a memo once `boom` is set. */
function Boom(props: BoomProps) {
  const text = createMemo(() => {
    if (props.boom) throw new Error("boom")
    return props.label
  })
  return <span>{text()}</span>
}

/** Define a failing element and a healthy sibling with `api`;  returns both, rendered. */
function pair(api: Implementation, options?: object) {
  const failing = nextTag("failing")
  const healthy = nextTag("healthy")
  api.customElement(failing, { boom: false, label: "ok" }, Boom, options)
  api.customElement(healthy, { boom: false, label: "ok" }, Boom, options)
  const container = mount(`<${failing}></${failing}><${healthy}></${healthy}>`)
  return [container.children[0], container.children[1]] as (HTMLElement & BoomProps)[]
}

/**
 * Run `fn`, swallowing what an unguarded failure throws or reports (Solid reports a halt asynchronously), then
 * wait a task so the report lands while the listener is up.
 * - The original's failure is REAL:  it halts the shared runtime, so `afterEach` re-arms it (`resetErrorHalt()`).
 */
async function surviving(fn: () => void) {
  const error = vi.spyOn(console, "error").mockImplementation(() => {})
  const swallow = (event: ErrorEvent) => event.preventDefault()
  // a user `error` listener makes Vitest log instead of failing the run
  window.addEventListener("error", swallow)
  try {
    fn()
  } catch {
    // the original rethrows out of `flush()`
  }
  await new Promise((resolve) => setTimeout(resolve, 0))
  window.removeEventListener("error", swallow)
  error.mockRestore()
}

describe("fix 7:  error boundary", () => {
  afterEach(() => {
    resetErrorHalt()
    cleanup()
  })

  reproduce(
    "an error in one element doesn't stop a sibling from updating",
    async (api) => {
      const [failing, healthy] = pair(api)
      await surviving(() => {
        failing.boom = true
        flush()
      })
      await surviving(() => {
        healthy.label = "updated"
        flush()
      })
      return healthy.shadowRoot!.textContent
    },
    // one uncaught error halts Solid's scheduler for the whole page (`[REACTIVITY_HALTED]`)
    { original: "ok", fork: "updated" }
  )

  it("fork:  default -- logs once naming the tag, empties the element, keeps it in the DOM", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const [failing] = pair(IMPLEMENTATIONS.fork)
    failing.boom = true
    flush()
    expect(error).toHaveBeenCalledWith(`<${failing.localName}> failed to render:`, expect.any(Error))
    expect(failing.isConnected).toBe(true)
    expect(failing.shadowRoot!.textContent).toBe("")
    error.mockRestore()
  })

  it("fork:  `fallback` content, `onError`, `:state(errored)`", () => {
    const seen: unknown[] = []
    const [failing, healthy] = pair(IMPLEMENTATIONS.fork, {
      internals: true,
      onError: (_element: HTMLElement, error: Error) => seen.push(error.message),
      fallback: (element: HTMLElement) => <b>{element.localName} is unavailable</b>
    })
    failing.boom = true
    flush()
    expect(seen).toEqual(["boom"])
    expect(failing.shadowRoot!.innerHTML).toBe(`<b>${failing.localName} is unavailable</b>`)
    expect(failing.matches(":state(errored)")).toBe(true)
    expect(healthy.matches(":state(errored)")).toBe(false)
  })

  it("fork:  an error thrown during setup is caught too", () => {
    const tag = nextTag("setup-throw")
    const onError = vi.fn()
    customElement(
      tag,
      {},
      () => {
        throw new Error("setup")
      },
      { onError, fallback: () => "fallback" }
    )
    const element = mount(`<${tag}></${tag}>`).firstElementChild!
    expect(onError).toHaveBeenCalledOnce()
    expect(element.shadowRoot!.textContent).toBe("fallback")
  })

  it("fork:  `errorEvent` -- cancelable;  cancelling skips the log and the fallback", () => {
    const tag = nextTag("error-event")
    const onError = vi.fn()
    customElement(
      tag,
      {},
      () => {
        throw new Error("setup")
      },
      { onError, fallback: () => "fallback", errorEvent: "ui-error" }
    )
    const container = mount()
    const details: unknown[] = []
    container.addEventListener("ui-error", (event) => {
      details.push(((event as CustomEvent).detail.error as Error).message)
      event.preventDefault()
    })
    const element = document.createElement(tag)
    container.append(element)
    expect(details).toEqual(["setup"])
    expect(onError).not.toHaveBeenCalled()
    expect(element.shadowRoot!.textContent).toBe("")
  })

  it("fork:  `errorBoundary: false` lets the error through (the old behaviour)", () => {
    const tag = nextTag("no-boundary")
    customElement(
      tag,
      {},
      () => {
        throw new Error("through")
      },
      { errorBoundary: false }
    )
    const element = document.createElement(tag)
    // a throw in `connectedCallback` is reported, not thrown, by `append()`
    const reported = new Promise<string>((resolve) =>
      window.addEventListener(
        "error",
        (event) => {
          event.preventDefault()
          resolve(event.message)
        },
        { once: true }
      )
    )
    document.body.append(element)
    return expect(reported).resolves.toMatch(/through/)
  })
})
