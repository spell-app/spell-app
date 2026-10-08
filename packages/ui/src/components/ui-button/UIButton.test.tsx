import { describe, expect, it, onTestFinished, vi } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { UI } from "$/ui/runtime"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-button"
import "$/ui/components/ui-modal"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-button/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-button>` and return it with its inner control. */
async function button(html: string) {
  const host = await ElementFixture.render<DOMElement>(html)
  const control = host.shadowRoot!.querySelector<HTMLElement>("[part~=button]")!
  return { host, control }
}

////////////////
// ## Classes
////////////////

describe("<ui-button> classes", () => {
  it.each([
    ["", "ui button"],
    ["primary", "ui primary button"],
    ['primary="yes"', "ui primary button"],
    ['primary="no"', "ui button"],
    ['primary="false"', "ui button"],
    ['size="small"', "ui small button"],
    ['size="medium"', "ui button"],
    ['color="red"', "ui red button"],
    ['color="rde"', "ui button"],
    ["secondary basic", "ui basic secondary button"],
    ["positive", "ui positive button"],
    ["negative tertiary", "ui negative tertiary button"],
    ["inverted", "ui inverted button"],
    ["fluid circular compact", "ui circular compact fluid button"],
    ["active", "ui active button"],
    ["disabled", "ui disabled button"],
    ["loading", "ui loading button"],
    ["toggle", "ui toggle button"],
    ["labeled", "ui labeled button"],
    ['labeled="right"', "ui right labeled button"],
    ["animated", "ui animated button"],
    ['animated="fade"', "ui fade animated button"],
    ['attached="top"', "ui top attached button"],
    ['floated="left"', "ui left floated button"],
    ["floated", "ui button"]
  ])("<ui-button %s>", async (attributes, classes) => {
    const { control } = await button(`<ui-button ${attributes}>Go</ui-button>`)
    expect(control.className).toBe(classes)
  })

  it("adds `icon` for icon-only and `labeled icon` buttons", async () => {
    const { control: iconOnly } = await button(`<ui-button icon="cloud" aria-label="Cloud"></ui-button>`)
    expect(iconOnly.className).toBe("ui button icon")
    const { control: labeledIcon } = await button(`<ui-button labeled icon="pause">Pause</ui-button>`)
    expect(labeledIcon.className).toBe("ui labeled button icon")
    const { control: withText } = await button(`<ui-button icon="pause">Pause</ui-button>`)
    expect(withText.className).toBe("ui button")
  })

  it("follows attribute and property changes", async () => {
    const { host, control } = await button(`<ui-button>Go</ui-button>`)
    host.setAttribute("color", "blue")
    await ElementFixture.tick()
    expect(control.className).toBe("ui blue button")
    ;(host as unknown as { primary: boolean }).primary = true
    await ElementFixture.tick()
    expect(control.className).toBe("ui blue primary button")
    expect(host.getAttribute("primary")).toBe("")
    ;(host as unknown as { primary: boolean }).primary = false
    await ElementFixture.tick()
    expect(host.hasAttribute("primary")).toBe(false)
  })

  it("wraps a joined label in a `labeled` root", async () => {
    const { host } = await button(`<ui-button labeled="left" color="red" icon="heart" label="2,048">Like</ui-button>`)
    const root = host.shadowRoot!.firstElementChild!
    expect(root.className).toBe("ui red left labeled button")
    expect(root.querySelector("[part~=button]")!.className).toBe("ui red button")
    expect(root.querySelector("[part~=label]")!.textContent).toBe("2,048")
  })

  it("sets host states for layout", async () => {
    const { host } = await button(`<ui-button attached="top" floated="left">Go</ui-button>`)
    expect(host.matches(":state(fluid)")).toBe(true)
    expect(host.matches(":state(left-floated)")).toBe(true)
  })

  it("hides with the `hidden` attribute, fluid or not", async () => {
    const { host } = await button(`<ui-button hidden>Go</ui-button>`)
    expect(getComputedStyle(host).display).toBe("none")
    host.setAttribute("fluid", "")
    await ElementFixture.settle()
    expect(getComputedStyle(host).display).toBe("none")
    host.removeAttribute("hidden")
    expect(getComputedStyle(host).display).toBe("flex")
  })
})

////////////////
// ## Behaviour
////////////////

describe("<ui-button> behaviour", () => {
  it("toggles `active` with aria-pressed and ui-toggle", async () => {
    const { host, control } = await button(`<ui-button toggle>Vote</ui-button>`)
    const events: boolean[] = []
    host.addEventListener("ui-toggle", (event) => events.push((event as CustomEvent).detail.active))
    expect(control.getAttribute("aria-pressed")).toBe("false")
    control.click()
    await ElementFixture.tick()
    expect(events).toEqual([true])
    expect(control.getAttribute("aria-pressed")).toBe("true")
    expect(control.classList.contains("active")).toBe(true)
    expect(host.matches(":state(active)")).toBe(true)
  })

  it("lets a controlling host veto the toggle from its handler", async () => {
    const { host, control } = await button(`<ui-button toggle active>Vote</ui-button>`)
    host.addEventListener("ui-toggle", () => ((host as unknown as { active: boolean }).active = true))
    control.click()
    await ElementFixture.tick()
    expect(control.getAttribute("aria-pressed")).toBe("true")
  })

  it("state texts (Fomantic's `state`):  the text follows `active`;  the label carries it, so no aria-pressed", async () => {
    const { host, control } = await button(
      `<ui-button toggle inactive-text="Follow" active-text="Following">Ignored</ui-button>`
    )
    const events: boolean[] = []
    host.addEventListener("ui-toggle", (event) => events.push((event as CustomEvent).detail.active))
    expect(control.textContent).toBe("Follow")
    expect(control.querySelector("slot")).toBeNull()
    expect(control.hasAttribute("aria-pressed")).toBe(false)
    control.click()
    await ElementFixture.tick()
    expect(events).toEqual([true])
    expect(control.textContent).toBe("Following")
    expect(host.matches(":state(active)")).toBe(true)
    control.click()
    await ElementFixture.tick()
    expect(control.textContent).toBe("Follow")
    await expectAccessible(host)
  })

  it("a single state text:  the content shows in the other state;  a host-set `active` switches it", async () => {
    const { host, control } = await button(`<ui-button active-text="Voted">Vote</ui-button>`)
    expect(control.querySelector("slot")).not.toBeNull()
    ;(host as unknown as { active: boolean }).active = true
    await ElementFixture.tick()
    expect(control.textContent).toBe("Voted")
  })

  it("blocks clicks while disabled", async () => {
    const { host, control } = await button(`<ui-button disabled>Nope</ui-button>`)
    const clicked = vi.fn()
    host.addEventListener("click", clicked)
    expect((control as HTMLButtonElement).disabled).toBe(true)
    control.click()
    host.click()
    expect(clicked).not.toHaveBeenCalled()
    expect(host.matches(":state(disabled)")).toBe(true)
  })

  it("submits its form with name=value via requestSubmit()", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><input name="q" value="x"><ui-button type="submit" name="go" value="yes">Go</ui-button></form>`
    )
    const spy = vi.spyOn(HTMLFormElement.prototype, "requestSubmit")
    let data: [string, FormDataEntryValue][] = []
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      data = [...new FormData(form)]
    })
    form.querySelector("ui-button")!.shadowRoot!.querySelector("button")!.click()
    expect(spy).toHaveBeenCalledOnce()
    expect(data).toEqual([
      ["q", "x"],
      ["go", "yes"]
    ])
    expect([...new FormData(form)]).toEqual([["q", "x"]])
    spy.mockRestore()
  })

  it("resets its form with type=reset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><input name="q" value="x"><ui-button type="reset">Reset</ui-button></form>`
    )
    const input = form.querySelector("input")!
    input.value = "changed"
    form.querySelector("ui-button")!.shadowRoot!.querySelector("button")!.click()
    expect(input.value).toBe("x")
  })

  it("renders the `icon` attribute as an svg", async () => {
    const { control } = await button(`<ui-button icon="cloud" aria-label="Cloud"></ui-button>`)
    await expect.poll(() => control.querySelector(".icon svg path")).not.toBeNull()
    expect(control.querySelector(".icon svg")!.getAttribute("aria-hidden")).toBe("true")
  })

  it("renders <a> for href", async () => {
    const { control } = await button(`<ui-button href="#x">Link</ui-button>`)
    expect(control.localName).toBe("a")
    expect(control.getAttribute("href")).toBe("#x")
    expect(control.hasAttribute("download")).toBe(false)
  })

  it("forwards `download` to the link, bare or naming the file", async () => {
    const { control: bare } = await button(`<ui-button href="logo.svg" download>SVG</ui-button>`)
    expect(bare.getAttribute("download")).toBe("")
    const { host, control: named } = await button(`<ui-button href="logo.svg" download="spell.svg">SVG</ui-button>`)
    expect(named.getAttribute("download")).toBe("spell.svg")
    host.removeAttribute("download")
    await ElementFixture.tick()
    expect(named.hasAttribute("download")).toBe(false)
  })

  it('`icon-position="right"` puts the icon box after the text, as a `right icon`', async () => {
    const { control } = await button(`<ui-button icon="arrow-right" icon-position="right">Next</ui-button>`)
    const children = [...control.children].map(
      (child) => child.localName + (child.className ? `.${child.className}` : "")
    )
    expect(children).toEqual(["slot", "span.right icon"])
    expect(control.className).toBe("ui button")
    const { control: leading } = await button(`<ui-button icon="arrow-left">Back</ui-button>`)
    expect([...leading.children].map((child) => child.localName)).toEqual(["span", "slot"])
  })

  it('`icon-position="right"` spaces the icon from the text on its start side', async () => {
    const { control } = await button(
      `<ui-button icon="arrow-right" icon-position="right" style="--ui-button-icon-spacing: 6px">Next</ui-button>`
    )
    const style = getComputedStyle(control.querySelector(".icon")!)
    expect(style.marginInlineStart).toBe("6px")
    expect(style.marginInlineEnd).toBe("-3px")
  })

  it("`host.click()` presses the inner control:  submits its form, ONE click reaching the page", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-button type="submit" name="go" value="yes">Go</ui-button></form>`
    )
    const host = form.querySelector<HTMLElement>("ui-button")!
    const submitted = vi.fn((event: Event) => event.preventDefault())
    const clicks = vi.fn()
    form.addEventListener("submit", submitted)
    form.addEventListener("click", clicks)
    host.click()
    expect(submitted).toHaveBeenCalledOnce()
    expect(clicks).toHaveBeenCalledOnce()
    expect(clicks.mock.calls[0]![0].target).toBe(host)
  })

  it("`host.click()`:  a host listener added BEFORE the element connected still sees one click", async () => {
    const host = document.createElement("ui-button")
    host.setAttribute("toggle", "")
    host.textContent = "Mute"
    const clicks = vi.fn()
    host.addEventListener("click", clicks)
    const wrapper = await ElementFixture.render(`<div></div>`)
    wrapper.append(host)
    await ElementFixture.settle(wrapper)
    host.click()
    await ElementFixture.tick()
    expect(clicks).toHaveBeenCalledOnce()
    expect(host.matches(":state(active)")).toBe(true)
  })

  it("`host.click()` vetoed by an earlier listener's preventDefault() presses nothing", async () => {
    const { host } = await button(`<ui-button toggle>Mute</ui-button>`)
    const wrapper = host.parentElement!
    wrapper.addEventListener("click", (event) => event.preventDefault(), { capture: true })
    host.click()
    await ElementFixture.tick()
    expect(host.matches(":state(active)")).toBe(false)
  })

  it("`host.click()` toggles a toggle button", async () => {
    const { host } = await button(`<ui-button toggle>Mute</ui-button>`)
    host.click()
    await ElementFixture.tick()
    expect(host.matches(":state(active)")).toBe(true)
  })

  it("delegates focus to the inner control", async () => {
    const { host, control } = await button(`<ui-button>Focus</ui-button>`)
    host.focus()
    expect(host.shadowRoot!.activeElement).toBe(control)
  })

  it("keeps a property set before upgrade (upgrade backstop)", async () => {
    const element = document.createElement("div")
    element.innerHTML = "<ui-later>x</ui-later>"
    const later = element.firstElementChild as HTMLElement & { color?: string }
    later.color = "red"
    const { UIButton } = await import("$/ui/components/ui-button")
    UIButton.define("ui-later")
    document.body.append(element)
    await ElementFixture.settle(element)
    expect(later.shadowRoot!.querySelector("button")!.className).toBe("ui red button")
    element.remove()
  })
})

////////////////
// ## <ui-buttons> / <ui-or>
////////////////

describe("<ui-buttons> / <ui-or>", () => {
  it("renders a group and an or", async () => {
    const group = await ElementFixture.render<DOMElement>(
      `<ui-buttons basic width="3"><ui-button>A</ui-button><ui-or></ui-or><ui-button>B</ui-button></ui-buttons>`
    )
    const root = group.shadowRoot!.firstElementChild!
    expect(root.className).toBe("ui basic three buttons")
    expect(root.getAttribute("role")).toBe("group")
    expect(group.matches(":state(fluid)")).toBe(true)
    const or = group.querySelector("ui-or")!
    expect(or.matches(":state(or)")).toBe(true)
    expect(or.shadowRoot!.querySelector(".or")!.getAttribute("data-text")).toBe("or")
  })

  it("renders `equal width`", async () => {
    const group = await ElementFixture.render<DOMElement>(
      `<ui-buttons width="equal"><ui-button>A</ui-button></ui-buttons>`
    )
    expect(group.shadowRoot!.firstElementChild!.className).toBe("ui equal width buttons")
  })

  it("`equal`:  every button as wide as the widest, the group hugging them", async () => {
    const natural = await group("")
    const widest = Math.max(...natural.buttons.map((button) => button.getBoundingClientRect().width))
    const { host, root, buttons } = await group("equal")
    expect(root.className).toBe("ui equal buttons")
    expect(host.matches(":state(fluid)")).toBe(false)
    for (const button of buttons) expect(button.getBoundingClientRect().width).toBeCloseTo(widest, -0.5)
    expect(root.getBoundingClientRect().width).toBeLessThan(GROUP_WIDTH)
  })

  it("`equal fluid`:  an equal share of the row each, as the older `width`", async () => {
    const { root, buttons } = await group("equal fluid")
    const share = root.clientWidth / buttons.length
    for (const button of buttons) expect(button.getBoundingClientRect().width).toBeCloseTo(share, -0.5)
    const older = await group('width="3"')
    expect(older.buttons.map((button) => Math.round(button.getBoundingClientRect().width))).toEqual(
      buttons.map((button) => Math.round(button.getBoundingClientRect().width))
    )
  })
})

/** Width of the box `group()` renders a button group in. */
const GROUP_WIDTH = 800

/** A `<ui-buttons attributes>` of three uneven buttons in a `GROUP_WIDTH` box;  returns it, its root and button boxes. */
async function group(attributes: string) {
  const box = await ElementFixture.render(
    `<div style="width: ${GROUP_WIDTH}px"><ui-buttons ${attributes}>` +
      `<ui-button>A</ui-button><ui-button>A much longer button</ui-button><ui-button>C</ui-button>` +
      `</ui-buttons></div>`
  )
  const host = box.querySelector<DOMElement>("ui-buttons")!
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  const buttons = [...host.querySelectorAll<DOMElement>("ui-button")].map((button) =>
    button.shadowRoot!.querySelector<HTMLElement>("[part~=button]")!
  )
  return { host, root, buttons }
}

////////////////
// ## Tokens from outside
////////////////

/**
 * Public `--ui-button-*` tokens set from OUTSIDE the shadow root reach the box:  the sheet declares only private
 * aliases (`--_ui-button-radius: var(--ui-button-radius, ...)`), never the public names (`docs/theming.md`
 * "Component tokens").
 */
describe("<ui-button> tokens from outside", () => {
  /** The inner control's top-left radius. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=button]")!).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await button(`<ui-button style="--ui-button-radius: 20px">Go</ui-button>`)
    expect(radius(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-button-radius: 20px"><div><ui-button>Go</ui-button></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-button")!)).toBe("20px")
  })

  it("takes a token set through `::part(button)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(button) { --ui-button-radius: 20px }</style><ui-button class="themed">Go</ui-button></div>`
    )
    expect(radius(wrapper.querySelector("ui-button")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-button-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-button-radius")
    })
    const { host } = await button(`<ui-button>Go</ui-button>`)
    expect(radius(host)).toBe("20px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const { host } = await button(`<ui-button>Go</ui-button>`)
    const probe = await ElementFixture.render(`<span style="border-top-left-radius: var(--ui-radius)"></span>`)
    expect(radius(host)).toBe(getComputedStyle(probe).borderTopLeftRadius)
  })

  it("`--ui-button-font-family` / `--ui-button-font-size` reach the label", async () => {
    const { control } = await button(
      `<ui-button style="--ui-button-font-family: serif; --ui-button-font-size: 15px">Add</ui-button>`
    )
    expect(getComputedStyle(control).fontFamily).toBe("serif")
    expect(getComputedStyle(control).fontSize).toBe("15px")
    const { control: small } = await button(
      `<ui-button size="small" style="--ui-button-font-size: 16px">Add</ui-button>`
    )
    expect(parseFloat(getComputedStyle(small).fontSize)).toBeLessThan(16)
  })

  it("variations:  a swap wins over the base token, a derived value follows it", async () => {
    const { control: circular } = await button(`<ui-button circular style="--ui-button-radius: 20px">Go</ui-button>`)
    expect(getComputedStyle(circular).borderTopLeftRadius).not.toBe("20px")
    const { control: compact } = await button(
      `<ui-button compact style="--ui-button-padding-block: 20px">Go</ui-button>`
    )
    expect(getComputedStyle(compact).paddingTop).toBe("15px")
  })

  it("reaches the members of a group, set on the group", async () => {
    const group = await ElementFixture.render<DOMElement>(
      `<ui-buttons style="--ui-button-radius: 20px"><ui-button>A</ui-button><ui-button>B</ui-button></ui-buttons>`
    )
    const [first, last] = [...group.querySelectorAll("ui-button")]
    expect(radius(first!)).toBe("20px")
    expect(getComputedStyle(last!.shadowRoot!.querySelector("[part~=button]")!).borderTopRightRadius).toBe("20px")
    expect(getComputedStyle(first!.shadowRoot!.querySelector("[part~=button]")!).borderTopRightRadius).toBe("0px")
  })
})

////////////////
// ## Invoker commands
////////////////

describe("<ui-button> invoker commands", () => {
  /** Render a button wired to `target`, which is rendered after it. */
  async function invoker(command: string, target: string) {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div><ui-button commandfor="t" command="${command}">Go</ui-button>${target}</div>`
    )
    const host = wrapper.querySelector<DOMElement>("ui-button")!
    const control = host.shadowRoot!.querySelector<HTMLButtonElement>("[part~=button]")!
    return { wrapper, host, control, target: wrapper.querySelector<HTMLElement>("#t")! }
  }

  /** Run `test` with `UI.browser.supports.invokers` forced to `value`. */
  async function withInvokers(value: boolean, test: () => Promise<void>) {
    await UI.load()
    const supports = UI.browser.supports
    const was = supports.invokers
    supports.invokers = value
    try {
      await test()
    } finally {
      supports.invokers = was
    }
  }

  it("detects invokers", async () => {
    await UI.load()
    expect(UI.browser.supports.invokers).toBe("commandForElement" in HTMLButtonElement.prototype)
  })

  it("native:  the inner button gets `command` and a `commandForElement` that is the light-DOM target", async () => {
    await withInvokers("commandForElement" in HTMLButtonElement.prototype, async () => {
      const { control, target } = await invoker("show-modal", `<dialog id="t">x</dialog>`)
      expect(control.getAttribute("command")).toBe("show-modal")
      expect(control.commandForElement).toBe(target)
    })
  })

  it("native:  a click opens a dialog, and re-resolves when `commandfor` changes", async () => {
    await withInvokers("commandForElement" in HTMLButtonElement.prototype, async () => {
      const { wrapper, host, control } = await invoker(
        "show-modal",
        `<dialog id="t">x</dialog><dialog id="u">y</dialog>`
      )
      host.setAttribute("commandfor", "u")
      await ElementFixture.settle()
      expect(control.commandForElement).toBe(wrapper.querySelector("#u"))
      control.click()
      expect((wrapper.querySelector("#u") as HTMLDialogElement).open).toBe(true)
      expect((wrapper.querySelector("#t") as HTMLDialogElement).open).toBe(false)
      ;(wrapper.querySelector("#u") as HTMLDialogElement).close()
    })
  })

  it("native:  a target that arrives after the button still works (resolved at click)", async () => {
    await withInvokers("commandForElement" in HTMLButtonElement.prototype, async () => {
      const { wrapper, control } = await invoker("show-popover", "")
      wrapper.insertAdjacentHTML("beforeend", `<div id="t" popover>late</div>`)
      control.click()
      expect(wrapper.querySelector<HTMLElement>("#t")!.matches(":popover-open")).toBe(true)
    })
  })

  it("native:  a custom command reaches a <ui-modal> (--toggle)", async () => {
    await withInvokers("commandForElement" in HTMLButtonElement.prototype, async () => {
      const { control } = await invoker("--toggle", `<ui-modal id="t" content="Body"></ui-modal>`)
      const modal = document.querySelector<DOMElement & { open: boolean }>("ui-modal#t")!
      control.click()
      await ElementFixture.settle()
      expect(modal.open).toBe(true)
      control.click()
      await ElementFixture.settle()
      expect(modal.open).toBe(false)
    })
  })

  it("fallback (no invokers):  the inner button carries no command, and a click runs show-modal / close", async () => {
    await withInvokers(false, async () => {
      const { host, control, target } = await invoker("show-modal", `<dialog id="t">x</dialog>`)
      expect(control.hasAttribute("command")).toBe(false)
      expect(control.commandForElement).toBeNull()
      control.click()
      expect((target as HTMLDialogElement).open).toBe(true)
      host.setAttribute("command", "close")
      await ElementFixture.settle()
      control.click()
      expect((target as HTMLDialogElement).open).toBe(false)
    })
  })

  it("fallback (no invokers):  show-popover / hide-popover / toggle-popover", async () => {
    await withInvokers(false, async () => {
      const { host, control, target } = await invoker("show-popover", `<div id="t" popover>p</div>`)
      control.click()
      expect(target.matches(":popover-open")).toBe(true)
      host.setAttribute("command", "hide-popover")
      await ElementFixture.settle()
      control.click()
      expect(target.matches(":popover-open")).toBe(false)
      host.setAttribute("command", "toggle-popover")
      await ElementFixture.settle()
      control.click()
      expect(target.matches(":popover-open")).toBe(true)
      control.click()
      expect(target.matches(":popover-open")).toBe(false)
    })
  })

  it("fallback (no invokers):  a custom command dispatches `command` with `{ command }`;  preventDefault skips built-ins", async () => {
    await withInvokers(false, async () => {
      const { host, control, target } = await invoker("--foo", `<div id="t" popover>p</div>`)
      const seen: string[] = []
      target.addEventListener("command", (event) => seen.push((event as Event & { command: string }).command))
      control.click()
      expect(seen).toEqual(["--foo"])
      host.setAttribute("command", "show-popover")
      await ElementFixture.settle()
      target.addEventListener("command", (event) => event.preventDefault())
      control.click()
      expect(seen).toEqual(["--foo", "show-popover"])
      expect(target.matches(":popover-open")).toBe(false)
    })
  })

  it("fallback (no invokers):  `--show` / `--toggle` reach a <ui-modal> as user actions", async () => {
    await withInvokers(false, async () => {
      const { host, control } = await invoker("--show", `<ui-modal id="t" content="Body"></ui-modal>`)
      const modal = document.querySelector<DOMElement & { open: boolean }>("ui-modal#t")!
      control.click()
      await ElementFixture.settle()
      expect(modal.open).toBe(true)
      host.setAttribute("command", "--toggle")
      await ElementFixture.settle()
      control.click()
      await ElementFixture.settle()
      expect(modal.open).toBe(false)
    })
  })

  it("a disabled button invokes nothing", async () => {
    await withInvokers(false, async () => {
      const wrapper = await ElementFixture.render<HTMLElement>(
        `<div><ui-button disabled commandfor="t" command="show-popover">Go</ui-button><div id="t" popover>p</div></div>`
      )
      wrapper.querySelector("ui-button")!.shadowRoot!.querySelector<HTMLElement>("[part~=button]")!.click()
      expect(wrapper.querySelector("#t")!.matches(":popover-open")).toBe(false)
    })
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-button> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
