import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { UI } from "$/ui/runtime"
import type { NagCloseDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-nag"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-nag/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A nag DOM element with its script API. */
type Nag = DOMElement & { close(): boolean; show(): boolean; clear(): void; readonly dismissed: boolean }

/** Storage keys the tests use, cleared around each test. */
const KEY = "ui-nag-test"

/** Render one `<ui-nag>`;  returns it with its bar. */
async function nag(html: string) {
  const host = await ElementFixture.render<Nag>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=nag]")
  return { host, root: root! }
}

/** Collect `detail`s of `name` events. */
function record<T = NagCloseDetail>(target: EventTarget, name: string) {
  const details: T[] = []
  target.addEventListener(name, (event) => details.push((event as CustomEvent<T>).detail))
  return details
}

/** Resolves with the next `name` event's detail. */
function next<T = NagCloseDetail>(target: EventTarget, name: string) {
  return new Promise<T>((resolve) =>
    target.addEventListener(name, (event) => resolve((event as CustomEvent<T>).detail), { once: true })
  )
}

/** Forget every dismissal the tests stored. */
function forget() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(KEY)
    store.removeItem(`${KEY}ExpirationDate`)
  }
  document.cookie = `${KEY}=; expires=${new Date(0).toUTCString()}; path=/`
}

beforeEach(async () => {
  await UI.load()
  forget()
  Fixture.render(`<style>ui-nag::part(nag) { --ui-animation-duration: 1ms }</style>`)
})

afterEach(() => forget())

////////////////
// ## Classes
////////////////

describe("<ui-nag> classes", () => {
  it.each([
    ["", "ui nag"],
    ['size="small"', "ui small nag"],
    ['color="teal" inverted', "ui teal inverted nag"],
    ["fixed bottom", "ui bottom fixed nag"],
    ["overlay", "ui overlay nag"],
    ['fixed="no"', "ui nag"]
  ])("<ui-nag %s>", async (attributes, classes) => {
    const { root } = await nag(`<ui-nag ${attributes}>Text</ui-nag>`)
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-nag> tokens from outside", () => {
  /** The bar's bottom-left radius. */
  function radius(root: Element): string {
    return getComputedStyle(root).borderBottomLeftRadius
  }

  it("takes a token set on the DOM element", async () => {
    const { root } = await nag(`<ui-nag style="--ui-nag-radius: 20px">Hi</ui-nag>`)
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(`<section style="--ui-nag-radius: 20px"><ui-nag>Hi</ui-nag></section>`)
    expect(radius(wrapper.querySelector("ui-nag")!.shadowRoot!.querySelector("[part~=nag]")!)).toBe("20px")
  })

  it("takes a token set through `::part(nag)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(nag) { --ui-nag-radius: 20px }</style><ui-nag class="themed">Hi</ui-nag></div>`
    )
    expect(radius(wrapper.querySelector("ui-nag")!.shadowRoot!.querySelector("[part~=nag]")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-nag-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-nag-radius")
    })
    const { root } = await nag(`<ui-nag>Hi</ui-nag>`)
    expect(radius(root)).toBe("20px")
  })

  it("`inverted` reads its own background, not the base one", async () => {
    const red = "rgb(255, 0, 0)"
    const { root } = await nag(`<ui-nag style="--ui-nag-background: ${red}">Hi</ui-nag>`)
    expect(getComputedStyle(root).backgroundColor).toBe(red)
    const { root: inverted } = await nag(`<ui-nag inverted style="--ui-nag-background: ${red}">Hi</ui-nag>`)
    expect(getComputedStyle(inverted).backgroundColor).not.toBe(red)
  })
})

////////////////
// ## Content
////////////////

describe("<ui-nag> content", () => {
  it("renders the slot, then a labelled close button (closable by default)", async () => {
    const { root } = await nag(`<ui-nag>Hello</ui-nag>`)
    expect([...root.children].map((child) => child.localName)).toEqual(["slot", "button"])
    const close = root.querySelector("button")!
    expect(close).toMatchObject({ type: "button", className: "close icon", ariaLabel: "Close" })
    await expect.poll(() => close.querySelector("svg")).not.toBeNull()
  })

  it("has no close button with closable=false", async () => {
    const { root } = await nag(`<ui-nag closable="false">Hello</ui-nag>`)
    expect(root.querySelector("button")).toBeNull()
  })
})

////////////////
// ## Closing
////////////////

describe("<ui-nag> closing", () => {
  it("fires ui-show, then on the close icon a cancelable ui-close, hidden, ui-hide", async () => {
    const host = Fixture.render<Nag>(`<ui-nag>Hello</ui-nag>`)
    await next(host, "ui-show")
    const closes = record(host, "ui-close")
    const hidden = next(host, "ui-hide")
    await userEvent.click(host.shadowRoot!.querySelector("button")!)
    expect(closes.map(({ reason }) => reason)).toEqual(["close"])
    expect((await hidden).reason).toBe("close")
    expect(host).toMatchObject({ hidden: true, isConnected: true })
    expect(host.matches(":state(dismissed)")).toBe(true)
  })

  it("stays when ui-close is cancelled", async () => {
    const { host } = await nag(`<ui-nag key="${KEY}" storage="local">Hello</ui-nag>`)
    host.addEventListener("ui-close", (event) => event.preventDefault())
    await userEvent.click(host.shadowRoot!.querySelector("button")!)
    expect(host.hidden).toBe(false)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("hides itself after display-time, storing nothing", async () => {
    // only the timers:  the slide's `animationend` still comes from the browser
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const { host } = await nag(`<ui-nag display-time="40" key="${KEY}" storage="local">Hello</ui-nag>`)
    const hidden = next(host, "ui-hide")
    await vi.advanceTimersByTimeAsync(40)
    expect((await hidden).reason).toBe("timeout")
    expect(host.hidden).toBe(true)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("invoker commands:  --show shows a hidden nag, --toggle then closes it (remembered)", async () => {
    const wrapper = await ElementFixture.render(
      `<div><button id="show" commandfor="n" command="--show">Show</button>` +
        `<button id="toggle" commandfor="n" command="--toggle">Toggle</button>` +
        `<ui-nag id="n" hidden key="${KEY}" storage="local">Hello</ui-nag></div>`
    )
    const host = wrapper.querySelector<Nag>("ui-nag")!
    const shown = next(host, "ui-show")
    wrapper.querySelector<HTMLButtonElement>("#show")!.click()
    await shown
    expect(host.hidden).toBe(false)
    const hidden = next(host, "ui-hide")
    wrapper.querySelector<HTMLButtonElement>("#toggle")!.click()
    expect((await hidden).reason).toBe("dismiss")
    expect(host.hidden).toBe(true)
    expect(localStorage.getItem(KEY)).not.toBeNull()
  })

  it("closes with Enter on the close icon, reached with Tab", async () => {
    const { host } = await nag(`<ui-nag>Hello</ui-nag>`)
    const before = Fixture.render<HTMLButtonElement>(`<button>Before</button>`)
    host.before(before)
    before.focus()
    await Keys.tab()
    expect(host.shadowRoot!.activeElement).toBe(host.shadowRoot!.querySelector("button"))
    const hidden = next(host, "ui-hide")
    await userEvent.keyboard("{Enter}")
    expect((await hidden).reason).toBe("close")
  })
})

////////////////
// ## Remembering
////////////////

describe("<ui-nag> remembering", () => {
  it("stores nothing without a key", async () => {
    const { host } = await nag(`<ui-nag storage="local">Hello</ui-nag>`)
    expect(host.close()).toBe(true)
    expect(localStorage.length === 0 || localStorage.getItem("nag") === null).toBe(true)
    expect(host.dismissed).toBe(false)
  })

  it.each(["local", "session"] as const)(
    "remembers a dismissal in %sStorage, and starts hidden next time",
    async (storage) => {
      const store = storage === "local" ? localStorage : sessionStorage
      const { host } = await nag(`<ui-nag key="${KEY}" storage="${storage}">Hello</ui-nag>`)
      const hidden = next(host, "ui-hide")
      host.close()
      expect((await hidden).reason).toBe("dismiss")
      expect(store.getItem(KEY)).toBe("dismiss")
      expect(host.dismissed).toBe(true)
      if (storage === "local") expect(new Date(store.getItem(`${KEY}ExpirationDate`)!) > new Date()).toBe(true)
      const again = Fixture.render<Nag>(`<ui-nag key="${KEY}" storage="${storage}">Hello again</ui-nag>`)
      expect(again.hidden).toBe(true)
      await again.ready
      expect(again.matches(":state(dismissed)")).toBe(true)
    }
  )

  it("remembers in a cookie by default, with path and samesite, and clears it", async () => {
    const { host } = await nag(`<ui-nag key="${KEY}" samesite="lax">Hello</ui-nag>`)
    host.close()
    expect(document.cookie.split("; ")).toContain(`${KEY}=dismiss`)
    const again = await ElementFixture.render<Nag>(`<ui-nag key="${KEY}">Again</ui-nag>`)
    expect(again.hidden).toBe(true)
    again.clear()
    expect(document.cookie.split("; ")).not.toContain(`${KEY}=dismiss`)
    expect(again.show()).toBe(true)
    expect(again.hidden).toBe(false)
  })

  it("stores a custom value, and only that value counts", async () => {
    localStorage.setItem(KEY, "other")
    const { host } = await nag(`<ui-nag key="${KEY}" storage="local" value="seen">Hello</ui-nag>`)
    expect(host.hidden).toBe(false)
    host.close()
    expect(localStorage.getItem(KEY)).toBe("seen")
  })

  it("shows again once the dismissal has expired, and drops it", async () => {
    localStorage.setItem(KEY, "dismiss")
    localStorage.setItem(`${KEY}ExpirationDate`, new Date(Date.now() - 1000).toUTCString())
    const { host } = await nag(`<ui-nag key="${KEY}" storage="local">Hello</ui-nag>`)
    expect(host.hidden).toBe(false)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("never expires with expires=0", async () => {
    const { host } = await nag(`<ui-nag key="${KEY}" storage="local" expires="0">Hello</ui-nag>`)
    host.close()
    expect(localStorage.getItem(KEY)).toBe("dismiss")
    expect(localStorage.getItem(`${KEY}ExpirationDate`)).toBeNull()
  })

  it("shows a dismissed nag that persists", async () => {
    localStorage.setItem(KEY, "dismiss")
    const { host } = await nag(`<ui-nag key="${KEY}" storage="local" persist>Hello</ui-nag>`)
    expect(host.hidden).toBe(false)
    expect(host.matches(":state(dismissed)")).toBe(false)
  })

  it("show() refuses while a dismissal is stored", async () => {
    localStorage.setItem(KEY, "dismiss")
    const { host } = await nag(`<ui-nag key="${KEY}" storage="local">Hello</ui-nag>`)
    expect(host.hidden).toBe(true)
    expect(host.show()).toBe(false)
    host.clear()
    const shown = next(host, "ui-show")
    expect(host.show()).toBe(true)
    await shown
    expect(host.hidden).toBe(false)
  })

  it("renders and closes when storage is blocked (a throwing localStorage)", async () => {
    const descriptor =
      Object.getOwnPropertyDescriptor(window, "localStorage") ??
      Object.getOwnPropertyDescriptor(Window.prototype, "localStorage")!
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError")
      }
    })
    try {
      const { host, root } = await nag(`<ui-nag key="${KEY}" storage="local">Hello</ui-nag>`)
      expect(host.hidden).toBe(false)
      expect(root.className).toBe("ui nag")
      const hidden = next(host, "ui-hide")
      expect(host.close()).toBe(true)
      await hidden
      expect(host.hidden).toBe(true)
      expect(host.dismissed).toBe(false)
    } finally {
      Object.defineProperty(window, "localStorage", descriptor)
    }
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-nag> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    localStorage.removeItem("example-cookie-nag")
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
