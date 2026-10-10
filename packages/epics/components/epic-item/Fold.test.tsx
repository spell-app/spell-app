import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-answer"
import "$/epics/components/epic-status"
import "$/epics/components/epic-note"
import "$/epics/components/epic-update"
import "$/epics/components/epic-phase"

/**
 * Every card with a heading band folds from it, the chevron first (Owen, 2026-10-08:  "EVERYTHING IN A SECTION BOX
 * SHOULD BE COLLAPSIBLE"):  each one's markup, and the words its fold button is named by.
 */
const CARDS = [
  { tag: "epic-reply", html: `<epic-reply from="Claude" at="2026-10-07 10:50" re="why"><p>Text</p></epic-reply>` },
  { tag: "epic-reply", html: `<epic-reply from="Owen" at="2026-10-07 10:42"><p>Text</p></epic-reply>` },
  { tag: "epic-answer", html: `<epic-answer title="Chrome"><p>Text</p></epic-answer>` },
  {
    tag: "epic-status",
    html: `<epic-status state="done" at="2026-10-08 14:20" done-at="2026-10-08 14:34"><p>Text</p><p slot="summary">Sum</p></epic-status>`
  },
  { tag: "epic-note", html: `<epic-note state="update" title="partly fixed"><p>Text</p></epic-note>` },
  { tag: "epic-update", html: `<epic-update phase="2"><p>Text</p></epic-update>` },
  { tag: "epic-updated", html: `<epic-updated at="2026-10-06T14:30" phase="3"><p>Text</p></epic-updated>` }
] as const

/** `host`'s shadow element matching `selector`. */
function find(host: Element, selector: string): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>(selector)!
}

/** Render `html` (a card), settled:  `<epic-update>` learns it's a note after its first frame. */
async function card(html: string) {
  const host = await ElementFixture.render(html)
  await new Promise(requestAnimationFrame)
  await ElementFixture.tick()
  return host
}

describe("every card folds from its heading (fold.button())", () => {
  test.each(CARDS)(
    "$tag:  the chevron FIRST in its heading, open to start;  a click folds it until-found, and back",
    async ({ html }) => {
      const host = await card(html)
      const button = find(host, "[part~='toggle']")
      const body = find(host, `#${button.getAttribute("aria-controls")}`)
      // first in its heading:  nothing drawn before it (the fence's:  in its own first cell)
      const first = button.closest(".fold-cell") ?? button
      expect(first.parentElement!.firstElementChild).toBe(first)
      expect([button.localName, button.getAttribute("aria-expanded"), body.hidden]).toEqual(["button", "true", false])
      expect(host.matches(":state(open)")).toBe(true)
      expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
      button.click()
      await ElementFixture.tick()
      expect([button.getAttribute("aria-expanded"), body.getAttribute("hidden"), host.matches(":state(open)")]).toEqual(
        ["false", "until-found", false]
      )
      // folded:  drawn as nothing, still findable
      expect(body.getBoundingClientRect().height).toBe(0)
      button.click()
      await ElementFixture.tick()
      expect([button.getAttribute("aria-expanded"), body.hidden]).toEqual(["true", false])
    }
  )

  test.each(CARDS)(
    "$tag:  a click on the heading's words folds too;  find-in-page reveals a folded one",
    async ({ html }) => {
      const host = await card(html)
      const button = find(host, "[part~='toggle']")
      const body = find(host, `#${button.getAttribute("aria-controls")}`)
      find(host, "[part~='label'], [part~='who']").click()
      await ElementFixture.tick()
      expect(body.getAttribute("hidden")).toBe("until-found")
      body.dispatchEvent(new Event("beforematch"))
      await ElementFixture.tick()
      expect([body.hidden, button.getAttribute("aria-expanded")]).toEqual([false, "true"])
    }
  )

  test.each(CARDS)(
    "$tag:  the button is named by its heading;  passes axe, open and folded, light and dark",
    async ({ html }) => {
      for (const scheme of ["light", "dark"]) {
        const background = scheme === "dark" ? "#1b1c1d" : "#fff"
        // the page's ink, as `<epic-page>` gives it:  the UPDATE note and the fence take it
        const wrap = await card(
          `<div style="color-scheme: ${scheme}; background: ${background}; color: CanvasText; padding: 4px">${html}</div>`
        )
        const host = wrap.firstElementChild!
        const button = find(host, "[part~='toggle']")
        const names = button.getAttribute("aria-labelledby")!.split(" ")
        expect(names.map((id) => find(host, `#${id}`).textContent!.trim()).join(" ")).not.toBe("")
        await expectAccessible(wrap)
        button.click()
        await ElementFixture.tick()
        await expectAccessible(wrap)
      }
    }
  )

  test("nothing to fold, no chevron:  an answer with no body, a bare UPDATE label, an empty note", async () => {
    const wrap = await card(
      `<div><epic-answer title="Chrome"></epic-answer><p>Changed <epic-update phase="2"></epic-update></p>` +
        `<epic-note state="done" title="option A"></epic-note><epic-updated at="2026-10-06T14:30"></epic-updated></div>`
    )
    for (const host of wrap.querySelectorAll("epic-answer, epic-update, epic-note, epic-updated")) {
      expect(host.shadowRoot!.querySelector("[part~='toggle']")).toBeNull()
      // a click on the heading does nothing
      host.shadowRoot!.querySelector<HTMLElement>("[part~='label']")!.click()
      await ElementFixture.tick()
      expect(host.shadowRoot!.querySelector("[hidden='until-found']")).toBeNull()
    }
  })

  test("a link in the heading doesn't fold (`<epic-updated of>`'s phase link)", async () => {
    const host = await card(`<epic-updated at="2026-10-06T14:30" of="5"><p>Text</p></epic-updated>`)
    const link = find(host, "a.of")
    link.addEventListener("click", (event) => event.preventDefault())
    link.click()
    await ElementFixture.tick()
    expect(find(host, "[part~='body']").hidden).toBe(false)
  })
})
