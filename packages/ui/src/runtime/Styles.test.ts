import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { Styles } from "./Styles"

/** A host with an open shadow root containing `<p class="probe">`. */
function shadowHost() {
  const host = Fixture.render(`<div></div>`)
  const root = host.attachShadow({ mode: "open" })
  root.innerHTML = `<p class="probe">probe</p>`
  return { root, probe: root.querySelector("p")! }
}

/** Remove any app stylesheet a test left behind. */
function removeAppSheet() {
  document.getElementById("ui-app-stylesheet")?.remove()
}

describe("Styles", () => {
  let styles: Styles
  beforeEach(() => {
    removeAppSheet()
    styles = new Styles()
  })
  afterEach(() => {
    styles.dispose()
    removeAppSheet()
  })

  it("ui.css's own page sheets are NOT adopted into the document when it's linked (--ui-page-sheet: linked)", () => {
    const marker = document.createElement("style")
    marker.textContent = ":root { --ui-page-sheet: linked }"
    document.head.append(marker)
    try {
      const sheet = styles.register("native", "p { color: red }", { page: true, linked: true })
      expect(document.adoptedStyleSheets).not.toContain(sheet)
      // shadow roots still get it
      const host = Fixture.render("<div></div>")
      const root = host.attachShadow({ mode: "open" })
      styles.setFoundation(["native"])
      styles.adoptInto(root, [])
      expect(root.adoptedStyleSheets).toContain(sheet)
    } finally {
      marker.remove()
    }
  })

  it("component page sheets (not in ui.css) still go onto a page that links ui.css", () => {
    const marker = document.createElement("style")
    marker.textContent = ":root { --ui-page-sheet: linked }"
    document.head.append(marker)
    try {
      const sheet = styles.register("scroll-lock-test", "html.x { overflow: hidden }", { page: true })
      expect(document.adoptedStyleSheets).toContain(sheet)
    } finally {
      marker.remove()
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (each) => each !== styles.sheet("scroll-lock-test")
      )
    }
  })

  it("register() is idempotent and updates sheets in place", () => {
    const sheet = styles.register("button", ".probe { color: red }")
    expect(styles.register("button", ".probe { color: red }")).toBe(sheet)
    styles.register("button", ".probe { color: blue }")
    expect(styles.sheet("button")).toBe(sheet)
    expect(sheet.cssRules[0]!.cssText).toContain("blue")
  })

  it("adoptInto() orders foundation, component, utilities, app sheet", async () => {
    const tokens = styles.register("tokens", ":host { --x: 1 }")
    const reset = styles.register("reset", "p { margin: 0 }")
    const button = styles.register("button", ".probe { color: red }")
    const utilities = styles.register("utilities", ".ui-bold { font-weight: bold }")
    styles.setFoundation(["tokens", "reset", "missing"])
    const { root } = shadowHost()
    styles.adoptInto(root, ["button"])
    await styles.appSheetReady
    // spread:  Firefox's `adoptedStyleSheets` is an observable array, which `toEqual` won't match to a plain one
    expect([...root.adoptedStyleSheets]).toEqual([tokens, reset, button, utilities, styles.appSheet])
  })

  it("re-pushes adopted roots when a foundation sheet is registered later, keeping foreign sheets", () => {
    const { root } = shadowHost()
    const foreign = new CSSStyleSheet()
    root.adoptedStyleSheets = [foreign]
    styles.setFoundation(["tokens"])
    styles.adoptInto(root, [])
    expect([...root.adoptedStyleSheets]).toEqual([foreign, styles.appSheet])
    const tokens = styles.register("tokens", ":host { --x: 1 }")
    expect([...root.adoptedStyleSheets]).toEqual([tokens, foreign, styles.appSheet])
  })

  it("swaps a re-registered sheet object into every root", () => {
    const { root } = shadowHost()
    styles.register("button", ".probe { color: red }")
    styles.adoptInto(root, ["button"])
    const replacement = new CSSStyleSheet()
    styles.register("button", replacement)
    expect(root.adoptedStyleSheets[0]).toBe(replacement)
  })

  it("shadow: true adopts into existing AND later roots, after utilities, before the app sheet", async () => {
    const utilities = styles.register("utilities", ".ui-bold { font-weight: bold }")
    const button = styles.register("button", ".probe { color: red }")
    const early = shadowHost()
    styles.adoptInto(early.root, ["button"])
    await styles.appSheetReady
    const base = styles.register("theme-base", ".probe { color: rgb(1, 1, 1) }", { shadow: true })
    const theme = styles.register("theme", ".probe { color: rgb(2, 2, 2) }", { shadow: true })
    expect([...early.root.adoptedStyleSheets]).toEqual([button, utilities, base, theme, styles.appSheet])
    // registration order is cascade order:  the later sheet wins inside the same layer
    expect(getComputedStyle(early.probe).color).toBe("rgb(2, 2, 2)")
    const late = shadowHost()
    styles.adoptInto(late.root, [])
    expect([...late.root.adoptedStyleSheets]).toEqual([utilities, base, theme, styles.appSheet])
    expect(document.adoptedStyleSheets).not.toContain(theme)
  })

  it("re-registering without shadow keeps it in shadow roots", () => {
    const { root } = shadowHost()
    styles.adoptInto(root, [])
    const theme = styles.register("theme", ".probe { color: rgb(3, 3, 3) }", { shadow: true })
    styles.register("theme", ".probe { color: rgb(4, 4, 4) }")
    expect(root.adoptedStyleSheets).toContain(theme)
  })

  it('register(name, "") removes a page + shadow sheet everywhere, and it can come back', () => {
    const { root, probe } = shadowHost()
    styles.adoptInto(root, [])
    const page = Fixture.render(`<p class="probe">page</p>`)
    const before = getComputedStyle(probe).color
    const theme = styles.register("theme", ".probe { color: rgb(5, 6, 7) }", { page: true, shadow: true })
    expect(getComputedStyle(probe).color).toBe("rgb(5, 6, 7)")
    expect(getComputedStyle(page).color).toBe("rgb(5, 6, 7)")

    styles.register("theme", "", { page: true, shadow: true })
    expect(styles.has("theme")).toBe(false)
    expect(document.adoptedStyleSheets).not.toContain(theme)
    expect(root.adoptedStyleSheets).not.toContain(theme)
    expect(getComputedStyle(probe).color).toBe(before)

    const again = styles.register("theme", ".probe { color: rgb(7, 6, 5) }", { page: true, shadow: true })
    expect(root.adoptedStyleSheets).toContain(again)
    expect(getComputedStyle(page).color).toBe("rgb(7, 6, 5)")
    styles.register("theme", "")
    expect(document.adoptedStyleSheets).not.toContain(again)
  })

  it('register(name, "") on an unknown name is a no-op', () => {
    expect(() => styles.register("never-registered", "")).not.toThrow()
    expect(styles.has("never-registered")).toBe(false)
  })

  it("page sheets go onto the document once", () => {
    const sheet = styles.register("native-test", "[data-native-test] { color: rgb(9, 9, 9) }", { page: true })
    styles.register("native-test", "[data-native-test] { color: rgb(9, 9, 9) }", { page: true })
    expect(document.adoptedStyleSheets.filter((each) => each === sheet)).toHaveLength(1)
    const element = Fixture.render(`<p data-native-test>x</p>`)
    expect(getComputedStyle(element).color).toBe("rgb(9, 9, 9)")
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((each) => each !== sheet)
  })

  it("adopts a <style id=ui-app-stylesheet> into shadow roots and follows edits", async () => {
    const style = document.createElement("style")
    style.id = "ui-app-stylesheet"
    style.textContent = ".probe { color: rgb(1, 2, 3) }"
    document.head.append(style)
    const { root, probe } = shadowHost()
    styles.adoptInto(root, [])
    await styles.appSheetReady
    expect(getComputedStyle(probe).color).toBe("rgb(1, 2, 3)")

    style.textContent = ".probe { color: rgb(4, 5, 6) }"
    await expect.poll(() => getComputedStyle(probe).color).toBe("rgb(4, 5, 6)")
  })

  it("picks up an app stylesheet inserted late, and its removal", async () => {
    const { root, probe } = shadowHost()
    styles.adoptInto(root, [])
    await styles.appSheetReady
    const before = getComputedStyle(probe).color
    const style = document.createElement("style")
    style.id = "ui-app-stylesheet"
    style.textContent = ".probe { color: rgb(7, 8, 9) }"
    document.body.append(style)
    await expect.poll(() => getComputedStyle(probe).color).toBe("rgb(7, 8, 9)")
    style.remove()
    await expect.poll(() => getComputedStyle(probe).color).toBe(before)
  })

  it("inlines @import in an app <style>, with layer and media", async () => {
    const css = ".probe { color: rgb(10, 20, 30) }"
    const url = URL.createObjectURL(new Blob([css], { type: "text/css" }))
    const style = document.createElement("style")
    style.id = "ui-app-stylesheet"
    style.textContent = `@import url("${url}") layer(ui.app) screen;\n.probe { font-weight: 700 }`
    document.head.append(style)
    const { root, probe } = shadowHost()
    styles.adoptInto(root, [])
    await styles.appSheetReady
    expect(getComputedStyle(probe).color).toBe("rgb(10, 20, 30)")
    expect(getComputedStyle(probe).fontWeight).toBe("700")
    URL.revokeObjectURL(url)
  })

  it("adopts a same-origin <link id=ui-app-stylesheet> via its cssRules", async () => {
    const url = URL.createObjectURL(new Blob([".probe { color: rgb(11, 22, 33) }"], { type: "text/css" }))
    const link = document.createElement("link")
    link.id = "ui-app-stylesheet"
    link.rel = "stylesheet"
    link.href = url
    document.head.append(link)
    const { root, probe } = shadowHost()
    styles.adoptInto(root, [])
    await expect.poll(() => getComputedStyle(probe).color).toBe("rgb(11, 22, 33)")
    URL.revokeObjectURL(url)
  })
})
