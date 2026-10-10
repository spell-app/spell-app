import { describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import h from "@solidjs/h"

import { spellCore, App, Drawable } from "$/core"
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

  test("a project's drawable class gets its tag, defined on the page once the class is whole", async () => {
    spellCore.defineElement(Card, "Solitaire")
    await Promise.resolve()
    expect(customElements.get("solitaire-card")).toBeDefined()
  })

  test("the element draws its thing, live, in its own shadow root, with the page's styles", async () => {
    spellCore.defineElement(Card, "Solitaire")
    await Promise.resolve()
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

  test("its type's own <css> is adopted after the page's, its super-types' first", async () => {
    class Note extends Drawable {
      static css = ".note { color: rgb(1, 2, 3) }"
      draw(): ReturnType<Drawable["draw"]> {
        return (h("p", { class: "note" }, "hi") as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    class Memo extends Note {
      static css = ".note { background-color: rgb(4, 5, 6) }"
    }
    spellCore.defineElement(Note, "Notes")
    spellCore.defineElement(Memo, "Notes")
    await Promise.resolve()
    const element = await ElementFixture.render<HTMLElement & { thing?: Memo }>("<note-memo></note-memo>")
    element.thing = new Memo()
    flush()
    const note = element.shadowRoot!.querySelector(".note")!
    expect(getComputedStyle(note).color).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(note).backgroundColor).toBe("rgb(4, 5, 6)")
  })

  test("defining it again, as a program run again does, keeps the tag", () => {
    const defined = customElements.get("solitaire-card")
    spellCore.defineElement(Card, "Solitaire")
    expect(customElements.get("solitaire-card")).toBe(defined)
  })

  describe("a program draws a drawable thing as its element (P5)", () => {
    /** A card that draws its rank as a button, counting its clicks;  a rank of `bad` throws. */
    class Ace extends Drawable {
      static elementTag = spellCore.defineElement(this, "Game")
      clicks = 0
      get rank() {
        return this.getProp("rank")
      }
      set rank(value) {
        this.setProp("rank", value)
      }
      draw(): ReturnType<Drawable["draw"]> {
        if (this.rank === "bad") throw new Error("no such rank")
        const button = h("button", { onClick: (_event: Event) => this.clicks++ }, () => `${this.rank}`)
        return (button as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    /** The game:  draws its two cards. */
    class Table extends App {
      cards = [new Ace(), new Ace()]
      draw(): ReturnType<Drawable["draw"]> {
        const children = this.cards.map((card) => () => spellCore.drawThing(card))
        return (h("div", { class: "table" }, ...children) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }

    test("each card is its own element;  one that can't draw shows its own error;  a change redraws only its card", async () => {
      const table = new Table()
      table.cards[0]!.rank = "ace"
      table.cards[1]!.rank = "bad"
      const root = document.createElement("div")
      document.body.append(root)
      spellCore.mountApp(table, root)
      flush()
      const [ace, bad] = [...root.querySelectorAll("game-ace")] as Array<HTMLElement & { ready: Promise<void> }>
      await Promise.all([ace!.ready, bad!.ready])
      flush()
      const button = ace!.shadowRoot!.querySelector("button")!
      expect(button.textContent).toBe("ace")
      expect(bad!.shadowRoot!.textContent).toContain("can't draw")

      // `draw()` read the rank to choose:  it runs again, inside the card's element;  nothing else is drawn again
      const badDrawing = bad!.shadowRoot!.firstElementChild
      table.cards[0]!.rank = "king"
      spellCore.flush()
      expect([...root.querySelectorAll("game-ace")]).toEqual([ace, bad])
      expect(bad!.shadowRoot!.firstElementChild).toBe(badDrawing)
      expect(ace!.shadowRoot!.querySelector("button")!.textContent).toBe("king")
      expect(button.isConnected).toBe(false)

      ace!.shadowRoot!.querySelector("button")!.click()
      expect(table.cards[0]!.clicks).toBe(1)
      root.remove()
    })
  })
})
