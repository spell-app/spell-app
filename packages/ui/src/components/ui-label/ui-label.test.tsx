import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-label"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-statistic"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-label/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A tiny image URL. */
const IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACw="

/** Render one `<ui-label>`;  returns it with its root. */
async function label(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=label]")!
  return { host, root }
}

describe("<ui-label> definition", () => {
  it("registers its texts with UI.i18n when DEFINED, before any instance exists", async () => {
    expect(document.querySelector("ui-label")).toBeNull()
    await UI.load()
    expect(UI.i18n.has("remove")).toBe(true)
    expect(UI.i18n.t("remove")).toBe("Remove")
  })
})

describe("<ui-label> classes", () => {
  it.each([
    ["", "ui label"],
    ['size="small"', "ui small label"],
    ['size="medium"', "ui label"],
    ['color="red" basic', "ui red basic label"],
    ['basic="no"', "ui label"],
    ['basic="yes"', "ui basic label"],
    ["tag", "ui tag label"],
    ["corner", "ui corner label"],
    ['corner="left"', "ui left corner label"],
    ["ribbon", "ui ribbon label"],
    ['ribbon="right"', "ui right ribbon label"],
    ["pointing", "ui pointing label"],
    ['pointing="below"', "ui below pointing label"],
    ['floating="left"', "ui left floating label"],
    ['attached="top right"', "ui top right attached label"],
    ["horizontal circular empty", "ui circular empty horizontal label"],
    ["fluid centered", "ui centered fluid label"],
    ["prompt", "ui prompt label"],
    ["active disabled inverted", "ui active disabled inverted label"],
    // `image` is a string kind:  no grammar slot, so the element adds the class as an extra, after the noun
    ["image", "ui label image"]
  ])("<ui-label %s>", async (attributes, classes) => {
    const { root } = await label(`<ui-label ${attributes}>Text</ui-label>`)
    expect(root.className).toBe(classes)
  })

  it("adds `icon` for an icon without text, not with text", async () => {
    const { root: alone } = await label(`<ui-label icon="check" aria-label="Checked"></ui-label>`)
    expect(alone.className).toBe("ui label icon")
    const { root: withText } = await label(`<ui-label icon="envelope">Mail</ui-label>`)
    expect(withText.className).toBe("ui label")
    const { root: slotted } = await label(
      `<ui-label aria-label="Checked"><ui-icon slot="icon" name="check"></ui-icon></ui-label>`
    )
    expect(slotted.className).toBe("ui label icon")
  })

  it("sets `:state(active)` / `:state(disabled)`", async () => {
    const { host } = await label(`<ui-label active disabled>x</ui-label>`)
    expect(host.matches(":state(active)")).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
  })
})

describe("<ui-label> content", () => {
  it("renders children in contract order:  image, icon, slot, detail, delete", async () => {
    const { root } = await label(`<ui-label image="${IMAGE}" icon="user" detail="Friend" removable>Veronika</ui-label>`)
    expect([...root.children].map((child) => `${child.localName}.${child.getAttribute("part")}`)).toEqual([
      "img.image",
      "span.icon",
      "slot.null",
      "span.detail",
      "button.delete"
    ])
    const image = root.querySelector("img")!
    expect(image.className).toBe("image")
    expect(image.getAttribute("alt")).toBe("")
    expect(root.querySelector(".detail")!.textContent).toBe("Friend")
    const remove = root.querySelector("button")!
    expect(remove.className).toBe("delete icon")
    expect(remove.getAttribute("aria-label")).toBe("Remove")
    await expect.poll(() => remove.querySelector("svg")).not.toBeNull()
  })

  it("renders <a> for href, and the icon box only when there's an icon", async () => {
    const { root } = await label(`<ui-label href="#tag" target="_blank">Tag</ui-label>`)
    expect(root.localName).toBe("a")
    expect(root.getAttribute("href")).toBe("#tag")
    expect(root.getAttribute("target")).toBe("_blank")
    expect(root.querySelector("[part~=icon]")).toBeNull()
    const { root: withIcon } = await label(`<ui-label icon="envelope">Mail</ui-label>`)
    const box = withIcon.querySelector("[part~=icon]")!
    expect(box.className).toBe("icon")
    await expect.poll(() => box.querySelector("svg")).not.toBeNull()
  })

  it("forwards the host's aria-label to the root", async () => {
    const { host, root } = await label(
      `<ui-label corner="left" href="#like" icon="heart" aria-label="Like"></ui-label>`
    )
    expect(root.getAttribute("aria-label")).toBe("Like")
    host.setAttribute("aria-label", "Love")
    await expect.poll(() => root.getAttribute("aria-label")).toBe("Love")
  })

  it("styles a bare `image` label's slotted <img>, without rendering one", async () => {
    const { root } = await label(`<ui-label image><img src="${IMAGE}" alt="">Joe</ui-label>`)
    expect(root.classList.contains("image")).toBe(true)
    expect(root.querySelector("img")).toBeNull()
  })
})

describe("<ui-label> remove", () => {
  it("dispatches a cancelable, composed ui-remove from the delete button", async () => {
    const { host, root } = await label(`<ui-label removable>Tag</ui-label>`)
    const events: CustomEvent[] = []
    document.addEventListener("ui-remove", (event) => events.push(event as CustomEvent), { once: true })
    root.querySelector("button")!.click()
    expect(events).toHaveLength(1)
    const [event] = events
    expect(event!.target).toBe(host)
    expect(event!.cancelable).toBe(true)
    expect(event!.composed).toBe(true)
    expect(event!.detail.originalEvent).toBeInstanceOf(MouseEvent)
    // the label never removes itself
    expect(host.isConnected).toBe(true)
  })

  it("reports a cancelled ui-remove", async () => {
    const { host, root } = await label(`<ui-label removable>Tag</ui-label>`)
    let prevented = false
    host.addEventListener("ui-remove", (event) => {
      event.preventDefault()
      queueMicrotask(() => (prevented = event.defaultPrevented))
    })
    root.querySelector("button")!.click()
    await ElementFixture.tick()
    expect(prevented).toBe(true)
    expect(host.isConnected).toBe(true)
  })

  it("doesn't fire while disabled", async () => {
    const { host, root } = await label(`<ui-label removable disabled>Tag</ui-label>`)
    let fired = 0
    host.addEventListener("ui-remove", () => fired++)
    root.querySelector("button")!.click()
    expect(fired).toBe(0)
    expect((root.querySelector("button") as HTMLButtonElement).disabled).toBe(true)
  })
})

describe("<ui-labels>", () => {
  it("renders the group", async () => {
    const group = await ElementFixture.render<UIHost>(
      `<ui-labels size="huge" color="blue" basic tag><ui-label>A</ui-label></ui-labels>`
    )
    const root = group.shadowRoot!.querySelector("[part~=group]")!
    expect(root.className).toBe("ui huge blue basic tag labels")
    expect(root.querySelector("slot")).not.toBeNull()
  })

  it("hands its look to the labels in it", async () => {
    const group = await ElementFixture.render<UIHost>(`<ui-labels circular><ui-label>1</ui-label></ui-labels>`)
    const child = group.querySelector("ui-label")!.shadowRoot!.querySelector<HTMLElement>("[part~=label]")!
    const plain = await ElementFixture.render<UIHost>(`<ui-label>1</ui-label>`)
    const plainRoot = plain.shadowRoot!.querySelector<HTMLElement>("[part~=label]")!
    expect(getComputedStyle(child).borderRadius).not.toBe(getComputedStyle(plainRoot).borderRadius)
  })
})

describe("<ui-label> colour (Fomantic:  only its own, or its `labels` group's)", () => {
  /** The first label's root inside `html`, and a plain label's, for comparison. */
  async function roots(html: string) {
    const wrapper = await ElementFixture.render<UIHost>(html)
    const root = (el: Element) => el.shadowRoot!.querySelector<HTMLElement>("[part~=label]")!
    const plain = await label(`<ui-label>Plain</ui-label>`)
    return { wrapper, inner: root(wrapper.querySelector("ui-label")!), plain: plain.root }
  }

  it("a plain label inside a coloured owner stays plain", async () => {
    const { inner, plain } = await roots(`<ui-segment color="red"><ui-label>A</ui-label></ui-segment>`)
    expect(getComputedStyle(inner).backgroundColor).toBe(getComputedStyle(plain).backgroundColor)
    expect(getComputedStyle(inner).color).toBe(getComputedStyle(plain).color)
  })

  it("a plain label inside a `ui-red` wrapper stays plain", async () => {
    const { inner, plain } = await roots(`<div class="ui-red"><ui-label>A</ui-label></div>`)
    expect(getComputedStyle(inner).backgroundColor).toBe(getComputedStyle(plain).backgroundColor)
  })

  it("its own colour still paints", async () => {
    const { inner, plain } = await roots(`<ui-segment color="red"><ui-label color="red">A</ui-label></ui-segment>`)
    expect(getComputedStyle(inner).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
  })

  it("a coloured `labels` group colours its members, in a coloured owner or not", async () => {
    const own = await roots(`<ui-labels color="red"><ui-label>A</ui-label></ui-labels>`)
    const red = await label(`<ui-label color="red">R</ui-label>`)
    expect(getComputedStyle(own.inner).backgroundColor).toBe(getComputedStyle(red.root).backgroundColor)
    expect(getComputedStyle(own.inner).color).toBe(getComputedStyle(red.root).color)
    const plainGroup = await roots(`<ui-segment color="red"><ui-labels><ui-label>A</ui-label></ui-labels></ui-segment>`)
    expect(getComputedStyle(plainGroup.inner).backgroundColor).toBe(getComputedStyle(plainGroup.plain).backgroundColor)
  })

  it("`tinted`:  the colour's soft fill (`--ui-color-background`) and text colour (`--ui-color-text`)", async () => {
    const { root } = await label(`<ui-label tinted color="red">Live</ui-label>`)
    expect(root.className).toBe("ui red tinted label")
    const probe = await ElementFixture.render(
      `<span class="ui-red" style="background: var(--ui-color-background); color: var(--ui-color-text)"></span>`
    )
    expect(getComputedStyle(root).backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
    expect(getComputedStyle(root).color).toBe(getComputedStyle(probe).color)
    const solid = await label(`<ui-label color="red">Live</ui-label>`)
    expect(getComputedStyle(root).backgroundColor).not.toBe(getComputedStyle(solid.root).backgroundColor)
    const uncoloured = await roots(`<div><ui-label tinted>Plain</ui-label></div>`)
    expect(getComputedStyle(uncoloured.inner).backgroundColor).toBe(getComputedStyle(uncoloured.plain).backgroundColor)
    const group = await roots(`<ui-labels tinted color="red"><ui-label>A</ui-label></ui-labels>`)
    expect(getComputedStyle(group.inner).backgroundColor).toBe(getComputedStyle(root).backgroundColor)
  })
})

describe("<ui-label> tokens from outside", () => {
  /** The label box's top-left radius, which `--ui-label-radius` drives. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=label]")!).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { root } = await label(`<ui-label style="--ui-label-radius: 12px">A</ui-label>`)
    expect(getComputedStyle(root).borderTopLeftRadius).toBe("12px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-label-radius: 12px"><div><ui-label>A</ui-label></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-label")!)).toBe("12px")
  })

  it("takes a token set through `::part(label)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(label) { --ui-label-radius: 12px }</style><ui-label class="themed">A</ui-label></div>`
    )
    expect(radius(wrapper.querySelector("ui-label")!)).toBe("12px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-label-radius", "12px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-label-radius")
    })
    const { root } = await label(`<ui-label>A</ui-label>`)
    expect(getComputedStyle(root).borderTopLeftRadius).toBe("12px")
  })

  it("reaches the members of a group, set on the group;  `circular` swaps it", async () => {
    const group = await ElementFixture.render(
      `<ui-labels style="--ui-label-radius: 12px"><ui-label>A</ui-label><ui-label circular>1</ui-label></ui-labels>`
    )
    const [plain, circular] = [...group.querySelectorAll("ui-label")]
    expect(radius(plain!)).toBe("12px")
    expect(radius(circular!)).not.toBe("12px")
  })

  it("owner tokens:  a plain owner sets the public `--ui-label-owner-edge`", async () => {
    const owner = await ElementFixture.render(
      `<div style="position: relative; --ui-label-owner-edge: 5px"><ui-label attached="top">A</ui-label></div>`
    )
    const box = getComputedStyle(owner.querySelector("ui-label")!.shadowRoot!.querySelector("[part~=label]")!)
    expect(box.top).toBe("-5px")
    expect(box.left).toBe("-5px")
  })
})

describe("<ui-label> statistic / standalone swap", () => {
  it("keeps elements slotted into it live when its root switches branch", async () => {
    // loaded first:  the label renders its slot synchronously, BEFORE the detail connects (the old owner bug's
    // trigger, `@spell-app/solid-element` fix 11)
    await UI.load()
    const holder = await ElementFixture.render(
      `<div><ui-statistic><ui-label>Dogs<ui-detail>214</ui-detail></ui-label></ui-statistic><p></p></div>`
    )
    const label = holder.querySelector<UIHost>("ui-label")!
    const detail = holder.querySelector<UIHost>("ui-detail")!
    expect(label.matches(":state(in-statistic)")).toBe(true)
    holder.querySelector("p")!.append(label)
    await ElementFixture.settle(holder)
    expect(label.shadowRoot!.querySelector("[part~=label]")!.className).toBe("ui label")
    detail.setAttribute("href", "#dogs")
    await ElementFixture.settle(holder)
    expect(detail.shadowRoot!.firstElementChild!.localName).toBe("a")
  })
})

describe("<ui-label> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
