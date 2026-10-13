import { describe, expect, it, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/brand/components/ui-brand-phone"

/** The shadow element with part `name` of a `<ui-brand-phone>`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)
}

/** The status bar icons of a `<ui-brand-phone>`, once all three have loaded. */
async function icons(host: Element): Promise<SVGSVGElement[]> {
  return vi.waitFor(() => {
    const svgs = [...part(host, "icons")!.querySelectorAll("svg")]
    if (svgs.length < 3) throw new Error("icons not loaded yet")
    return svgs
  })
}

/** A phone holding an app:  a title and a card with a button. */
const APP = `<ui-brand-phone>
  <h3 id="title" style="margin: 0">Habit Tracker</h3>
  <div id="card" style="height: 40px"><button id="add">Add habit</button></div>
</ui-brand-phone>`

describe("<ui-brand-phone>", () => {
  it("frames its app:  300px wide, 32px corners, a status bar with 9:41 and three icons", async () => {
    const host = await ElementFixture.render(APP)
    const phone = part(host, "phone")!
    const style = getComputedStyle(phone)
    expect(host.getBoundingClientRect().width).toBe(300)
    expect({
      tag: phone.localName,
      width: phone.getBoundingClientRect().width,
      radius: style.borderTopLeftRadius,
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom],
      classes: [...phone.classList]
    }).toEqual({ tag: "section", width: 300, radius: "32px", padding: ["14px", "14px", "18px"], classes: ["phone"] })
    expect(part(host, "time")!.textContent).toBe("9:41")
    expect(await icons(host)).toHaveLength(3)
  })

  it("shows its light children below the status bar, 12px apart", async () => {
    const host = await ElementFixture.render(APP)
    const status = part(host, "status")!.getBoundingClientRect()
    const title = host.querySelector("#title")!.getBoundingClientRect()
    const card = host.querySelector("#card")!.getBoundingClientRect()
    expect(title.top - status.bottom).toBe(12)
    expect(card.top - title.bottom).toBe(12)
    expect(card.width).toBe(300 - 2 - 28)
  })

  it("`time` sets the clock", async () => {
    const host = await ElementFixture.render(`<ui-brand-phone time="10:30"></ui-brand-phone>`)
    expect(part(host, "time")!.textContent).toBe("10:30")
    host.setAttribute("time", "8:00")
    await ElementFixture.tick()
    expect(part(host, "time")!.textContent).toBe("8:00")
  })

  it("`dimmed` fades it to 45% (animated) and marks it busy", async () => {
    const host = await ElementFixture.render(`<ui-brand-phone dimmed></ui-brand-phone>`)
    const phone = part(host, "phone")!
    const { opacity, transitionDuration } = getComputedStyle(phone)
    expect({
      dimmed: phone.classList.contains("dimmed"),
      opacity,
      transitionDuration,
      busy: phone.getAttribute("aria-busy")
    }).toEqual({ dimmed: true, opacity: "0.45", transitionDuration: "0.4s", busy: "true" })
    host.removeAttribute("dimmed")
    await ElementFixture.tick()
    expect(phone.hasAttribute("aria-busy")).toBe(false)
    expect(phone.classList.contains("dimmed")).toBe(false)
  })

  it('is a region named "App preview";  `label` renames it, `label=""` makes it a plain frame', async () => {
    const host = await ElementFixture.render(`<div>
      <ui-brand-phone></ui-brand-phone>
      <ui-brand-phone label="Habit Tracker preview"></ui-brand-phone>
      <ui-brand-phone label=""></ui-brand-phone>
    </div>`)
    const [plain, named, frame] = [...host.querySelectorAll("ui-brand-phone")].map((phone) => part(phone, "phone")!)
    expect(plain!.getAttribute("aria-label")).toBe("App preview")
    expect(named!.getAttribute("aria-label")).toBe("Habit Tracker preview")
    expect(frame!.hasAttribute("aria-label")).toBe(false)
  })

  it("hides the status bar from screen readers, and passes axe", async () => {
    const host = await ElementFixture.render(APP)
    await icons(host)
    expect(part(host, "status")!.getAttribute("aria-hidden")).toBe("true")
    await expectAccessible(host)
  })

  it("takes no focus itself:  Tab goes straight to the app's controls", async () => {
    const host = await ElementFixture.render(`<div><button id="before">Before</button>${APP}</div>`)
    host.querySelector<HTMLButtonElement>("#before")!.focus()
    await userEvent.tab()
    expect(document.activeElement!.id).toBe("add")
  })

  it("ivory in light mode, the raised surface in dark;  tokens size and colour it", async () => {
    const tokens = "--spell-surface-warm: rgb(1, 2, 3); --ui-surface-muted: rgb(4, 5, 6)"
    const host = await ElementFixture.render(`<div style="${tokens}">
      <ui-brand-phone></ui-brand-phone>
      <ui-brand-phone style="color-scheme: dark"></ui-brand-phone>
      <ui-brand-phone style="--ui-brand-phone-width: 200px; --ui-brand-phone-background: rgb(7, 8, 9)"></ui-brand-phone>
    </div>`)
    const [light, dark, custom] = [...host.querySelectorAll("ui-brand-phone")]
    expect(getComputedStyle(part(light!, "phone")!).backgroundColor).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(part(dark!, "phone")!).backgroundColor).toBe("rgb(4, 5, 6)")
    expect(getComputedStyle(part(custom!, "phone")!).backgroundColor).toBe("rgb(7, 8, 9)")
    expect(custom!.getBoundingClientRect().width).toBe(200)
  })

  it("still shows the app, in a bare slot, when its render fails", async () => {
    const host = await ElementFixture.render(`<ui-brand-phone time="7:15" label="Preview">
      <p id="app">Habit Tracker</p>
    </ui-brand-phone>`)
    await ElementFixture.breakRender(host as never)
    expect(host.matches(":state(errored)")).toBe(true)
    expect(part(host, "phone")).toBeNull()
    expect(host.shadowRoot!.querySelector("slot")!.assignedElements()[0]!.id).toBe("app")
  })
})
