import { describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import h from "@solidjs/h"

import { spellCore, Drawable } from "$/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { installSpellElements } from "./SpellElement"

import "$/app/solid/cellsBridge"

/**
 * A drawable thing's own element (epic `drawable-thing`, P3):  a project's last line defines its drawable classes'
 * elements, and each draws its `thing` in its own shadow root, as a Spell UI element does.
 */
describe("SpellElement", () => {
  installSpellElements(spellCore)

  /** A card that draws its rank. */
  class Card extends Drawable {
    get rank() {
      return this.getProp("rank")
    }
    set rank(value) {
      this.setProp("rank", value)
    }
    draw(): ReturnType<Drawable["draw"]> {
      return (h("span", { class: "rank" }, () => `${this.rank}`) as unknown as () => ReturnType<Drawable["draw"]>)()
    }
  }

  test("a project's drawable class gets its tag, defined on the page", () => {
    spellCore.defineElements("Solitaire", { Card })
    expect(customElements.get("solitaire-card")).toBeDefined()
  })

  test("the element draws its thing, live, in its own shadow root, with the page's styles", async () => {
    spellCore.defineElements("Solitaire", { Card })
    const card = new Card()
    card.rank = "ace"
    const element = await ElementFixture.render<HTMLElement & { thing?: Card }>("<solitaire-card></solitaire-card>")
    element.thing = card
    flush()
    expect(element.shadowRoot!.querySelector(".rank")?.textContent).toBe("ace")
    expect(element.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0)

    card.rank = "king"
    spellCore.flush()
    expect(element.shadowRoot!.querySelector(".rank")?.textContent).toBe("king")
  })

  test("defining it again, as a program run again does, keeps the tag", () => {
    const defined = customElements.get("solitaire-card")
    spellCore.defineElements("Solitaire", { Card })
    expect(customElements.get("solitaire-card")).toBe(defined)
  })
})
