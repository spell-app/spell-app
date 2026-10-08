/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 10:  delegated events don't leak Solid's walk state out of shadow roots. */

import { Dynamic, render } from "@solidjs/web"
import { afterEach, describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { customElement } from "./customElement"
import { noShadowDOM } from "./current"
import { cleanup, mount, nextTag, reproduce, type CustomElementFn } from "./testing"

/** What a listener saw:  `target`, `currentTarget`, `composedPath()[0]` as local names. */
type Seen = { target?: string; currentTarget?: string; path0?: string }

/** Record `event` as `Seen`. */
function see(event: Event): Seen {
  return {
    target: name(event.target),
    currentTarget: name(event.currentTarget),
    path0: name(event.composedPath()[0])
  }
}

/** Local name of an element (`"host"` for a custom element), `#document` for the document. */
function name(target: EventTarget | null | undefined): string | undefined {
  if (!target) return undefined
  const local = (target as Element).localName
  if (local?.includes("-")) return "host"
  return local ?? (target as Node).nodeName
}

/** Define `<field-*>`:  an `<input>` with delegated `onInput` / `onKeyDown` / `onFocusIn` and a `<button onClick>`. */
function defineField(define: CustomElementFn, log: string[] = []): string {
  const tag = nextTag("field")
  define(tag, {}, () => (
    <>
      <input
        onInput={() => log.push("input")}
        onKeyDown={() => log.push("keydown")}
        onFocusIn={() => log.push("focusin")}
      />
      <button onClick={() => log.push("click")}>go</button>
    </>
  ))
  return tag
}

/** A Solid app rendered into a fresh container, so a second delegation root exists on the page. */
function solidApp(tag: string, log: string[] = []) {
  const container = mount()
  const dispose = render(
    () => (
      <section onClick={() => log.push("app section")}>
        <Dynamic component={tag} onClick={(event: Event) => log.push(`app host ${name(event.currentTarget)}`)} />
      </section>
    ),
    container
  )
  return { host: container.querySelector(tag) as HTMLElement, dispose }
}

describe("fix 10:  delegated events and shadow roots", () => {
  afterEach(cleanup)

  reproduce(
    "a page listener on the host sees `target` === host, `currentTarget` === host",
    ({ customElement }) => {
      const tag = defineField(customElement)
      const host = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement
      let seen: Seen = {}
      host.addEventListener("click", (event) => (seen = see(event)))
      host.shadowRoot!.querySelector("button")!.click()
      return seen
    },
    {
      original: { target: "button", currentTarget: "button", path0: "button" },
      fork: { target: "host", currentTarget: "host", path0: "button" }
    }
  )

  reproduce(
    "an enclosing Solid app's handlers run for a click inside the element",
    ({ customElement }) => {
      const log: string[] = []
      const tag = defineField(customElement, log)
      const { host, dispose } = solidApp(tag, log)
      host.shadowRoot!.querySelector("button")!.click()
      dispose()
      return log
    },
    { original: ["click"], fork: ["click", "app host host", "app section"] }
  )

  reproduce(
    "handlers above a nested element run, with that element as `target`",
    ({ customElement }) => {
      const log: string[] = []
      const inner = defineField(customElement, log)
      const outer = nextTag("outer")
      customElement(outer, {}, () => (
        <div onClick={(event: Event) => log.push(`outer div ${name(event.target)}`)}>
          <Dynamic component={inner} onClick={(event: Event) => log.push(`outer host ${name(event.currentTarget)}`)} />
        </div>
      ))
      const host = mount(`<${outer}></${outer}>`).firstElementChild as HTMLElement
      host.shadowRoot!.querySelector(inner)!.shadowRoot!.querySelector("button")!.click()
      return log
    },
    { original: ["click"], fork: ["click", "outer host host", "outer div host"] }
  )

  describe("fork", () => {
    it("page listeners for `input`, `click`, `keydown`, `focusin` see the host;  `composedPath()[0]` the inner node", async () => {
      const log: string[] = []
      const tag = defineField(customElement, log)
      const host = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement
      const seen: Record<string, Seen[]> = {}
      for (const type of ["input", "click", "keydown", "focusin"]) {
        seen[type] = []
        const record = (event: Event) => seen[type].push(see(event))
        host.addEventListener(type, record)
        document.addEventListener(type, record)
      }
      await userEvent.type(host.shadowRoot!.querySelector("input")!, "a")
      await userEvent.click(host.shadowRoot!.querySelector("button")!)
      expect(log).toEqual(["focusin", "keydown", "input", "click"])
      expect(seen.input).toEqual([
        { target: "host", currentTarget: "host", path0: "input" },
        { target: "host", currentTarget: "#document", path0: "input" }
      ])
      expect(seen.keydown[0]).toEqual({ target: "host", currentTarget: "host", path0: "input" })
      expect(seen.focusin[0]).toEqual({ target: "host", currentTarget: "host", path0: "input" })
      expect(seen.click).toEqual([
        { target: "host", currentTarget: "host", path0: "button" },
        { target: "host", currentTarget: "#document", path0: "button" }
      ])
    })

    it("with a Solid app on the page, page listeners still see the host", () => {
      const tag = defineField(customElement)
      const { host, dispose } = solidApp(tag)
      const seen: Seen[] = []
      host.addEventListener("click", (event) => seen.push(see(event)))
      document.addEventListener("click", (event) => seen.push(see(event)), { once: true })
      host.shadowRoot!.querySelector("button")!.click()
      dispose()
      expect(seen[0]).toEqual({ target: "host", currentTarget: "host", path0: "button" })
      // NOTE:  `currentTarget` on the document is still wrong here:  the APP's container leaks it (plain Solid)
      expect(seen[1]).toMatchObject({ target: "host", path0: "button" })
    })

    it("slotted light content:  its handler, the component's and the app's each run once", async () => {
      const log: string[] = []
      const tag = nextTag("slotting")
      customElement(tag, {}, () => (
        <button onClick={(event) => log.push(`inner ${name(event.target)}`)} style={{ padding: "8px" }}>
          <slot />
        </button>
      ))
      const container = mount()
      const dispose = render(
        () => (
          <main onClick={() => log.push("app main")}>
            <Dynamic component={tag} onClick={() => log.push("app host")}>
              <b onClick={() => log.push("app b")}>Save</b>
            </Dynamic>
          </main>
        ),
        container
      )
      const host = container.querySelector(tag)!
      const seen: Seen[] = []
      host.addEventListener("click", (event) => seen.push(see(event)))
      await userEvent.click(host.querySelector("b")!)
      dispose()
      expect(log).toEqual(["app b", "inner b", "app host", "app main"])
      expect(seen).toEqual([{ target: "b", currentTarget: "host", path0: "b" }])
    })

    it("a nested element slotted into another:  the outer slot's ancestors run once, target = the nested host", () => {
      const log: string[] = []
      const inner = defineField(customElement, log)
      const outer = nextTag("option")
      customElement(outer, {}, () => (
        <div role="option" onClick={(event: Event) => log.push(`option ${name(event.target)}`)}>
          <slot />
        </div>
      ))
      const host = mount(`<${outer}><${inner}></${inner}></${outer}>`).firstElementChild as HTMLElement
      host.querySelector(inner)!.shadowRoot!.querySelector("button")!.click()
      expect(log).toEqual(["click", "option host"])
    })

    it("`stopPropagation()` in the component stops there:  no host handler, no page listener", () => {
      const log: string[] = []
      const tag = nextTag("stopper")
      customElement(tag, {}, () => <button onClick={(event) => event.stopPropagation()}>stop</button>)
      const { host, dispose } = solidApp(tag, log)
      host.addEventListener("click", () => log.push("page"))
      host.shadowRoot!.querySelector("button")!.click()
      dispose()
      expect(log).toEqual([])
    })

    it("a component's own listener on its render root passes through untouched, and can be removed", () => {
      const seen: Seen[] = []
      const record = (event: Event) => seen.push(see(event))
      const tag = nextTag("own")
      customElement(tag, {}, () => <button onClick={() => {}}>own</button>)
      const host = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement
      const root = host.shadowRoot!
      root.addEventListener("click", record)
      root.querySelector("button")!.click()
      root.removeEventListener("click", record)
      root.querySelector("button")!.click()
      expect(seen).toEqual([{ target: "button", currentTarget: "#document-fragment", path0: "button" }])
    })

    it("`noShadowDOM()`:  no own `currentTarget` left for the page", () => {
      const tag = nextTag("light")
      customElement(tag, {}, () => {
        noShadowDOM()
        return <button onClick={() => {}}>light</button>
      })
      const host = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement
      let seen: Seen = {}
      const record = (event: Event) => (seen = see(event))
      document.addEventListener("click", record)
      host.querySelector("button")!.click()
      document.removeEventListener("click", record)
      expect(seen).toEqual({ target: "button", currentTarget: "#document", path0: "button" })
    })

    it("reconnecting (a fresh render each time) keeps one working listener", () => {
      const log: string[] = []
      const tag = defineField(customElement, log)
      const container = mount(`<${tag}></${tag}>`)
      const host = container.firstElementChild as HTMLElement
      host.remove()
      return Promise.resolve().then(() => {
        container.append(host)
        host.shadowRoot!.querySelector("button")!.click()
        expect(log).toEqual(["click"])
      })
    })
  })
})
