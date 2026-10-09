import { createEffect, createRoot, flush } from "solid-js"
import { render, type JSX } from "@solidjs/web"
import { describe, expect, it } from "vite-plus/test"

import { E } from "$/ui/core"
import { F } from "$/ui/forms"
import type { UIComponentClass, DOMElement } from "$/ui/elements"
import type { ComponentVocabulary, Dictionary } from "$/ui/vocabulary"

import { ElementFixture } from "$/ui/test/ElementFixture"

/**
 * The reactive members (`Reactive`):  `@state` and `@derived` on any class, then the component side --
 * vocabulary getters, `@controlled`, `@cssState`, `@onChange`, `attributes`, `$` -- on a stand-in element.
 */

/** A plain class with state and derived values;  counts its computes. */
class Basket {
  @E.state accessor items: readonly string[] = []
  @E.state accessor discount = 0
  @E.state({ equals: false }) accessor pokes = 0
  @E.state static accessor openBaskets = 0

  /** How many times `summary` computed. */
  computes = 0

  @E.derived
  get summary(): string {
    this.computes++
    return `${this.items.length} items, ${this.discount}% off`
  }

  /** A `@derived` over a `@derived`. */
  @E.derived
  get shout(): string {
    return this.summary.toUpperCase()
  }

  /** Every call of `onItemsChanged()`, with its cleanups. */
  readonly calls: string[] = []

  @E.onChange("items", "discount")
  protected onItemsChanged(items: readonly string[], discount: number) {
    this.calls.push(`${items.join("+")} @${discount}`)
    return () => this.calls.push("cleanup")
  }

  /** A plain getter over two members:  its effect tracks both. */
  get isBigOrder(): boolean {
    return this.items.length * (100 - this.discount) >= 200
  }

  /** Every call of `onBigOrderChanged()`:  NOT idempotent (it counts). */
  readonly bigOrders: boolean[] = []

  @E.onChange("isBigOrder")
  protected onBigOrderChanged(isBigOrder: boolean) {
    this.bigOrders.push(isBigOrder)
  }

  /** The items minus `"bag"`, the same list while equal. */
  @E.derived({ equals: E.isSameList })
  get groceries(): readonly string[] {
    return this.items.filter((item) => item !== "bag")
  }

  /** How many times `groceryCount` computed. */
  groceryCounts = 0

  /** A `@derived` over `groceries`. */
  @E.derived
  get groceryCount(): number {
    this.groceryCounts++
    return this.groceries.length
  }
}

describe("Reactive:  @state", () => {
  it("a read right after a write sees it, no flush", () => {
    const basket = new Basket()
    basket.items = ["apple"]
    expect(basket.items).toEqual(["apple"])
    basket.discount = 10
    expect(basket.discount).toBe(10)
  })

  it("works on a static accessor (the class's record)", () => {
    Basket.openBaskets += 1
    expect(Basket.openBaskets).toBe(1)
  })

  it("a Solid computation follows it;  an equal write tells nobody, `equals: false` always does", () => {
    const basket = new Basket()
    const runs = { discount: 0, pokes: 0 }
    const host = document.createElement("div")
    const unmount = render(
      () => (
        <span>
          {discount()}
          {pokes()}
        </span>
      ),
      host
    )
    expect(host.textContent).toBe("00")
    basket.discount = 0
    basket.pokes = 0
    flush()
    expect(runs).toEqual({ discount: 1, pokes: 2 })
    basket.discount = 5
    flush()
    expect(host.textContent).toBe("50")
    expect(runs).toEqual({ discount: 2, pokes: 2 })
    unmount()

    /** `discount`, counting the binding's runs. */
    function discount() {
      runs.discount++
      return basket.discount
    }

    /** `pokes`, counting the binding's runs. */
    function pokes() {
      runs.pokes++
      return basket.pokes
    }
  })
})

describe("Reactive:  writes in an owned scope", () => {
  it("never throw:  the record is written at once, the notification a microtask later", async () => {
    const basket = new Basket()
    const host = document.createElement("div")
    const unmount = render(() => <span>{basket.discount}</span>, host)
    createRoot((dispose) => {
      // a component body:  Solid 2 forbids a signal write here (`REACTIVE_WRITE_IN_OWNED_SCOPE`)
      basket.discount = 7
      expect(basket.discount).toBe(7)
      dispose()
    })
    await Promise.resolve()
    flush()
    expect(host.textContent).toBe("7")
    unmount()
  })
})

describe("Reactive:  @derived", () => {
  it("is fresh right after a write in a plain function", () => {
    const basket = new Basket()
    expect(basket.summary).toBe("0 items, 0% off")
    basket.items = ["apple", "pear"]
    expect(basket.summary).toBe("2 items, 0% off")
    basket.discount = 20
    expect(basket.shout).toBe("2 ITEMS, 20% OFF")
  })

  it("recomputes only when a dependency changed", () => {
    const basket = new Basket()
    void basket.summary
    void basket.summary
    expect(basket.computes).toBe(1)
    basket.discount = 0
    void basket.summary
    expect(basket.computes).toBe(1)
    basket.discount = 5
    void basket.summary
    void basket.shout
    void basket.shout
    expect(basket.computes).toBe(2)
  })

  it("JSX reading it re-renders on a change", () => {
    const basket = new Basket()
    const host = document.createElement("div")
    const unmount = render(() => <p>{basket.shout}</p>, host)
    expect(host.textContent).toBe("0 ITEMS, 0% OFF")
    basket.items = ["fig"]
    flush()
    expect(host.textContent).toBe("1 ITEMS, 0% OFF")
    basket.discount = 50
    flush()
    expect(host.textContent).toBe("1 ITEMS, 50% OFF")
    unmount()
  })
})

describe("Reactive:  @derived({ equals })", () => {
  it("keeps the old value while equal:  same identity, and an outer @derived doesn't recompute", () => {
    const basket = new Basket()
    basket.items = ["apple"]
    const first = basket.groceries
    expect(basket.groceryCount).toBe(1)
    basket.items = ["apple", "bag"]
    expect(basket.groceries).toBe(first)
    expect(basket.groceryCount).toBe(1)
    expect(basket.groceryCounts).toBe(1)
    basket.items = ["apple", "pear"]
    expect(basket.groceries).toEqual(["apple", "pear"])
    expect(basket.groceryCount).toBe(2)
  })
})

describe("Reactive:  @onChange", () => {
  it("calls the method with the members' values, now and on every change;  its return is the cleanup", () => {
    const basket = new Basket()
    const dispose = createRoot((dispose) => {
      E.Reactive.startEffects(basket)
      return dispose
    })
    flush()
    expect(basket.calls).toEqual([" @0"])
    basket.items = ["kiwi"]
    flush()
    expect(basket.calls).toEqual([" @0", "cleanup", "kiwi @0"])
    dispose()
    expect(basket.calls.at(-1)).toBe("cleanup")
  })

  it("over a getter, runs once per real change of its value, not on every change underneath", () => {
    const basket = new Basket()
    const dispose = createRoot((dispose) => {
      E.Reactive.startEffects(basket)
      return dispose
    })
    flush()
    expect(basket.bigOrders).toEqual([false])
    basket.items = ["a"]
    flush()
    basket.discount = 10
    flush()
    expect(basket.bigOrders).toEqual([false])
    basket.items = ["a", "b", "c"]
    flush()
    expect(basket.bigOrders).toEqual([false, true])
    basket.discount = 20
    flush()
    basket.items = ["a", "b", "c", "d"]
    flush()
    expect(basket.bigOrders).toEqual([false, true])
    basket.discount = 90
    flush()
    expect(basket.bigOrders).toEqual([false, true, false])
    dispose()
  })

  it("with several members, skips a re-run where none of their values changed", () => {
    const basket = new Basket()
    const dispose = createRoot((dispose) => {
      E.Reactive.startEffects(basket)
      return dispose
    })
    flush()
    // both written, then back to the same values before the flush:  the effect re-runs, its values didn't change
    const items = basket.items
    basket.items = ["kiwi"]
    basket.discount = 5
    basket.items = items
    basket.discount = 0
    flush()
    expect(basket.calls).toEqual([" @0"])
    dispose()
  })
})

////////////////
// ## Components
////////////////

/** The stand-in element's vocabulary. */
const VOCABULARY = {
  tag: "x-reactive",
  noun: "reactive",
  attributes: [
    { name: "label", kind: "string", description: "A label." },
    { name: "open", kind: "boolean", description: "Open?" },
    { name: "size", kind: "size", description: "Size." }
  ],
  events: [{ name: "ui-change", detail: "{ open: boolean }", description: "Open changed.", cancelable: true }],
  slots: [],
  parts: [{ name: "box", description: "The box." }],
  states: [{ name: "open", description: "Open." }],
  texts: []
} as const satisfies ComponentVocabulary

/** A component on every decorator. */
class ReactiveTest extends E.UIComponent<typeof VOCABULARY> {
  @E.cssState("open")
  @E.controlled("open")
  accessor isOpen = false

  /** How many times `title` computed. */
  computes = 0

  @E.derived
  get title(): string {
    this.computes++
    return `${this.label ?? "untitled"} (${this.size ?? "medium"})`
  }

  /** Host `aria-label`, raw. */
  get ariaLabel(): string | null {
    return this.attributes["aria-label"]
  }

  /** The `label` attribute's raw text, by its canonical name. */
  get rawLabel(): string | null {
    return this.attributes.label
  }

  /** `ping` events heard through `on()`. */
  pings = 0

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.on("ping", () => this.pings++)
  }

  /** `onOpenChanged()` calls. */
  readonly opens: boolean[] = []

  @E.onChange("isOpen")
  protected onOpenChanged(isOpen: boolean) {
    this.opens.push(isOpen)
  }

  /** A user toggle, through `requestChange()`. */
  toggle(): boolean {
    const next = !this.isOpen
    return this.requestChange("isOpen", next, () => this.send("ui-change", { open: next }))
  }

  render(): JSX.Element {
    return (
      <div part={this.partForName("box")} aria-label={this.ariaLabel ?? undefined}>
        {this.title}
      </div>
    )
  }
}
/** The vocabulary getters, typed (`UIComponent`'s doc). */
interface ReactiveTest extends E.AttributeValues<typeof VOCABULARY> {}
Object.defineProperty(ReactiveTest.prototype, "vocabulary", { value: VOCABULARY })
;(ReactiveTest as unknown as UIComponentClass & typeof E.UIComponent).define()

/** The stand-in in Spanish:  `<x-reactivo etiqueta="..." abierto>`. */
const SPANISH = { lang: "es", attributes: { label: "etiqueta", open: "abierto" } } as const satisfies Dictionary
;(ReactiveTest as unknown as UIComponentClass & typeof E.UIComponent).define("x-reactivo", SPANISH)

/** Render one stand-in element;  returns its host, component and box. */
async function reactive(html: string) {
  const host = await ElementFixture.render<DOMElement & Record<string, unknown>>(html)
  const component = host.component as unknown as ReactiveTest
  const box = () => host.shadowRoot!.querySelector<HTMLElement>("[part=box]")!
  return { host, component, box }
}

describe("Reactive:  components", () => {
  it("vocabulary getters read the converted value fresh, right after a property write", async () => {
    const { host, component } = await reactive(`<x-reactive label="A" size="large"></x-reactive>`)
    expect(component.label).toBe("A")
    host.label = "B"
    expect(component.label).toBe("B")
    expect(component.title).toBe("B (large)")
  })

  it("a @derived over vocabulary getters recomputes only on a change, and the view follows", async () => {
    const { host, component, box } = await reactive(`<x-reactive label="A"></x-reactive>`)
    expect(box().textContent).toBe("A (medium)")
    const before = component.computes
    void component.title
    expect(component.computes).toBe(before)
    host.setAttribute("size", "small")
    expect(component.title).toBe("A (small)")
    await ElementFixture.tick()
    expect(box().textContent).toBe("A (small)")
  })

  it("@controlled:  the host's property when set, else the starting value;  requestChange() writes the host", async () => {
    const { host, component } = await reactive(`<x-reactive></x-reactive>`)
    expect(component.isOpen).toBe(false)
    expect(component.toggle()).toBe(true)
    expect(host.open).toBe(true)
    expect(component.isOpen).toBe(true)
    expect(host.hasAttribute("open")).toBe(true)
    host.addEventListener("ui-change", (event) => event.preventDefault(), { once: true })
    expect(component.toggle()).toBe(false)
    expect(component.isOpen).toBe(true)
  })

  it("requestChange():  a host re-setting the property during the event wins", async () => {
    const { host, component } = await reactive(`<x-reactive></x-reactive>`)
    host.addEventListener("ui-change", () => (host.open = false), { once: true })
    expect(component.toggle()).toBe(false)
    expect(component.isOpen).toBe(false)
  })

  it("@cssState and @onChange follow the member", async () => {
    const { host, component } = await reactive(`<x-reactive></x-reactive>`)
    expect(host.matches(":state(open)")).toBe(false)
    host.open = true
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(true)
    expect(component.opens).toEqual([false, true])
  })

  it("attributes:  raw strings, null when absent, tracked", async () => {
    const { host, component, box } = await reactive(`<x-reactive></x-reactive>`)
    expect(component.ariaLabel).toBeNull()
    host.setAttribute("aria-label", "Name")
    expect(component.ariaLabel).toBe("Name")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(box().getAttribute("aria-label")).toBe("Name")
  })

  it("a vocabulary member's setter writes the host property:  it reflects, and the getter reads it back", async () => {
    const { host, component } = await reactive(`<x-reactive></x-reactive>`)
    component.label = "C"
    expect(host.label).toBe("C")
    expect(host.getAttribute("label")).toBe("C")
    expect(component.label).toBe("C")
    component.label = undefined
    expect(host.hasAttribute("label")).toBe(false)
  })

  it("on a translated tag, the setter writes ITS property, and attributes take canonical names", async () => {
    const { host, component } = await reactive(`<x-reactivo etiqueta="A"></x-reactivo>`)
    expect(component.label).toBe("A")
    expect(component.rawLabel).toBe("A")
    component.label = "D"
    expect(host.etiqueta).toBe("D")
    expect(host.getAttribute("etiqueta")).toBe("D")
    expect(host.hasAttribute("label")).toBe(false)
    expect(component.label).toBe("D")
    expect(component.rawLabel).toBe("D")
  })

  it("on():  hears the host until it's released, across a move", async () => {
    const { host, component } = await reactive(`<x-reactive></x-reactive>`)
    host.dispatchEvent(new Event("ping"))
    host.remove()
    document.body.append(host)
    host.dispatchEvent(new Event("ping"))
    expect(component.pings).toBe(2)
    host.dispose()
    host.dispatchEvent(new Event("ping"))
    expect(component.pings).toBe(2)
  })

  it("$:  an Accessor per member", async () => {
    const { host, component } = await reactive(`<x-reactive label="A"></x-reactive>`)
    expect(component.$.title()).toBe("A (medium)")
    host.open = true
    expect(component.$.isOpen()).toBe(true)
    expect(component.$.title).toBe(component.$.title)
  })
})

describe("Reactive:  vocabulary getters vs base members", () => {
  /** Every family's English vocabulary (components and docs elements). */
  const vocabularies = Object.values(
    import.meta.glob<Record<string, unknown>>(["/src/components/*/*.en.ts", "/src/docs-components/*/*.en.ts"], {
      eager: true
    })
  ).flatMap((module) =>
    Object.values(module).filter(
      (value): value is ComponentVocabulary =>
        typeof value === "object" && value !== null && "tag" in value && "attributes" in value
    )
  )

  it("no attribute is named like a member of UIComponent or FormComponent (the base would hide its getter)", async () => {
    const { component } = await reactive(`<x-reactive></x-reactive>`)
    const standIn = new Set(["computes", "opens", "pings"])
    const fields = Object.keys(component).filter((key) => !standIn.has(key))
    const taken = new Set([...fields, ...namesOf(E.UIComponent.prototype), ...namesOf(F.FormComponent.prototype)])
    const clashes = vocabularies.flatMap(({ tag, attributes }) =>
      attributes
        .map(({ name }) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()))
        .filter((key) => taken.has(key))
        .map((key) => `<${tag}> ${key}`)
    )
    expect(vocabularies.length).toBeGreaterThan(40)
    expect(clashes).toEqual([])
  })

  /** Every member name on `prototype` and the prototypes above it, up to `Object`. */
  function namesOf(prototype: object): string[] {
    const names: string[] = []
    for (let current = prototype; current !== Object.prototype; current = Object.getPrototypeOf(current))
      names.push(...Object.getOwnPropertyNames(current))
    return names
  }
})

/** The `@fromContent` / `@whileConnected` stand-in's vocabulary:  nothing of its own. */
const CONTENT_VOCABULARY = {
  tag: "x-content",
  noun: "content",
  attributes: [],
  events: [],
  slots: [],
  parts: [{ name: "box", description: "The box." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

/** A component reading its light DOM (`@fromContent`), and following its connection (`@whileConnected`). */
class ContentTest extends E.UIComponent<typeof CONTENT_VOCABULARY> {
  /** How many times `childCount` computed. */
  computes = 0

  /** Its children, counted. */
  @E.fromContent({ childList: true })
  get childCount(): number {
    this.computes++
    return this.domElement.children.length
  }

  /** Ids of the elements marked `data-mark`, anywhere inside;  the same list while their number is. */
  @E.fromContent({
    subtree: true,
    attributeFilter: ["data-mark"],
    equals: (a: string[], b: string[]) => a.length === b.length
  })
  get marked(): string[] {
    return Array.from(this.domElement.querySelectorAll("[data-mark]"), (element) => element.id)
  }

  /** How many mutations each `onTitleChanged()` call had. */
  readonly titleChanges: number[] = []

  @E.fromContent({ attributeFilter: ["title"] })
  protected onTitleChanged(mutations: MutationRecord[]) {
    this.titleChanges.push(mutations.length)
  }

  /** `connect` / `disconnect`, in order. */
  readonly connections: string[] = []

  @E.whileConnected
  protected followConnection() {
    this.connections.push("connect")
    return () => {
      this.connections.push("disconnect")
    }
  }

  render(): JSX.Element {
    return <span part={this.partForName("box")}>{this.childCount}</span>
  }
}
Object.defineProperty(ContentTest.prototype, "vocabulary", { value: CONTENT_VOCABULARY })
;(ContentTest as unknown as UIComponentClass & typeof E.UIComponent).define()

/** Render one `<x-content>` with `inner` inside;  returns its host, component and box. */
async function content(inner = "") {
  const host = await ElementFixture.render<DOMElement>(`<x-content>${inner}</x-content>`)
  const component = host.component as unknown as ContentTest
  const box = () => host.shadowRoot!.querySelector<HTMLElement>("[part=box]")!
  return { host, component, box }
}

describe("Reactive:  @fromContent", () => {
  it("a getter follows the light DOM, and the view with it", async () => {
    const { host, component, box } = await content(`<b></b>`)
    expect(component.childCount).toBe(1)
    expect(box().textContent).toBe("1")
    host.append(document.createElement("i"))
    await ElementFixture.tick()
    expect(component.childCount).toBe(2)
    await ElementFixture.tick()
    expect(box().textContent).toBe("2")
  })

  it("recomputes only on a change it watches", async () => {
    const { host, component } = await content(`<b></b>`)
    void component.childCount
    const before = component.computes
    host.setAttribute("data-other", "")
    host.firstElementChild!.append(document.createElement("i"))
    await ElementFixture.tick()
    void component.childCount
    expect(component.computes).toBe(before)
  })

  it("with `equals`:  an equal rescan keeps the old value, and tells nobody", async () => {
    const { component } = await content(`<b id="a" data-mark></b><b id="b"></b>`)
    const first = component.marked
    expect(first).toEqual(["a"])
    const heard: string[][] = []
    const dispose = createRoot((dispose) => {
      createEffect(
        () => component.marked,
        (marked) => {
          heard.push(marked)
        }
      )
      return dispose
    })
    flush()
    expect(heard).toEqual([["a"]])
    const [a, b] = Array.from(component.domElement.children)
    a!.removeAttribute("data-mark")
    b!.setAttribute("data-mark", "")
    await ElementFixture.tick()
    expect(component.marked).toBe(first)
    b!.setAttribute("data-mark", "")
    a!.setAttribute("data-mark", "")
    await ElementFixture.tick()
    expect(component.marked).toEqual(["a", "b"])
    expect(heard).toEqual([["a"], ["a", "b"]])
    dispose()
  })

  it("a method is called on each change it watches, with its mutations;  not at the start", async () => {
    const { host, component } = await content()
    expect(component.titleChanges).toEqual([])
    host.title = "One"
    host.title = "Two"
    host.setAttribute("data-other", "")
    await ElementFixture.tick()
    expect(component.titleChanges).toEqual([2])
  })

  it("keeps watching across a move;  stops when the host is released", async () => {
    const { host, component } = await content()
    void component.childCount
    host.remove()
    document.body.append(host)
    host.append(document.createElement("b"))
    await ElementFixture.tick()
    expect(component.childCount).toBe(1)
    host.dispose()
    const before = component.computes
    host.append(document.createElement("b"))
    await ElementFixture.tick()
    expect(component.computes).toBe(before)
  })
})

describe("Reactive:  @whileConnected", () => {
  it("runs on each connect;  its cleanup on each disconnect", async () => {
    const { host, component } = await content()
    expect(component.connections).toEqual(["connect"])
    host.remove()
    await ElementFixture.tick()
    expect(component.connections).toEqual(["connect", "disconnect"])
    document.body.append(host)
    await ElementFixture.tick()
    expect(component.connections).toEqual(["connect", "disconnect", "connect"])
  })
})
