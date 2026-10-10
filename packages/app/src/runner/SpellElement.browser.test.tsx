import { describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import h from "@solidjs/h"

import { spellCore, App, Drawable, DrawableList } from "$/core"
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

  describe("a drawable list's items are its element's children (P6)", () => {
    /** A card, drawn as its name. */
    class Chip extends Drawable {
      static elementTag = spellCore.defineElement(this, "Games")
      constructor(public label = "") {
        super()
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("b", {}, this.label) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    /** A pile:  its outside a box around its slot. */
    class Heap extends DrawableList<Chip> {
      static elementTag = spellCore.defineElement(this, "Games")
      static instanceType = Chip
      draw(): ReturnType<Drawable["draw"]> {
        return (h("div", { class: "heap" }, h("slot", {})) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    /** Two heaps, side by side. */
    class Board extends App {
      left = new Heap()
      right = new Heap()
      draw(): ReturnType<Drawable["draw"]> {
        const heaps = [() => spellCore.drawThing(this.left), () => spellCore.drawThing(this.right)]
        return (h("div", {}, ...heaps) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }

    test("<game-heap> holds <game-chip>s, shown through its frame's slot;  a chip moved moves to the other heap", async () => {
      const board = new Board()
      const [a, b] = [new Chip("a"), new Chip("b")]
      spellCore.append(board.left, a)
      spellCore.append(board.left, b)
      const root = document.createElement("div")
      document.body.append(root)
      spellCore.mountApp(board, root)
      flush()
      const [left, right] = [...root.querySelectorAll("game-heap")] as HTMLElement[]
      await ElementFixture.settle(root)
      const labels = (heap: HTMLElement) =>
        [...heap.children].map((chip) => `${chip.localName} ${chip.shadowRoot?.textContent}`)
      expect(labels(left!)).toEqual(["game-chip a", "game-chip b"])
      expect(left!.shadowRoot!.querySelector(".heap slot")).not.toBeNull()
      expect((left!.children[0] as HTMLElement).assignedSlot).toBe(left!.shadowRoot!.querySelector("slot"))

      spellCore.remove(board.left, a)
      spellCore.append(board.right, a)
      spellCore.flush()
      await ElementFixture.settle(root)
      expect(labels(left!)).toEqual(["game-chip b"])
      expect(labels(right!)).toEqual(["game-chip a"])
      root.remove()
    })
  })

  describe("a program run again swaps what's behind its tags (P7)", () => {
    /** A version of a drawable `Badge` class:  its CSS colours its text `color`, and it draws `text`. */
    function badgeVersion(color: string, text: string) {
      return class Badge extends Drawable {
        static css = `.badge { color: ${color} }`
        draw(): ReturnType<Drawable["draw"]> {
          return (h("i", { class: "badge" }, text) as unknown as () => ReturnType<Drawable["draw"]>)()
        }
      }
    }

    test("its CSS changes in the elements already on the page;  its new things draw with its new draw()", async () => {
      const First = badgeVersion("rgb(1, 2, 3)", "first")
      spellCore.defineElement(First, "Swaps")
      await Promise.resolve()
      const old = await ElementFixture.render<HTMLElement & { thing?: unknown }>("<swap-badge></swap-badge>")
      old.thing = new First()
      flush()
      const oldBadge = old.shadowRoot!.querySelector(".badge")!
      expect(getComputedStyle(oldBadge).color).toBe("rgb(1, 2, 3)")

      // the edited program, run again:  a new class for the same tag
      const Second = badgeVersion("rgb(7, 8, 9)", "second")
      spellCore.defineElement(Second, "Swaps")
      await Promise.resolve()
      expect(old.shadowRoot!.querySelector(".badge")).toBe(oldBadge)
      expect(getComputedStyle(oldBadge).color).toBe("rgb(7, 8, 9)")

      const fresh = document.createElement("swap-badge") as HTMLElement & { thing?: unknown; ready: Promise<void> }
      fresh.thing = new Second()
      old.after(fresh)
      await fresh.ready
      flush()
      expect(fresh.shadowRoot!.querySelector(".badge")!.textContent).toBe("second")
    })
  })

  describe("its outside is its type's:  attributes, properties, methods (P8)", () => {
    /** A playing card:  its rank (one of ace, 2 ... 12), suit and side, drawn as e.g. `ace of spades`. */
    class Ace2 extends Drawable {
      static elementTag = spellCore.defineElement(this, "Plain")
      get rank() {
        return this.getProp("rank")
      }
      set rank(value) {
        this.setProp("rank", value)
      }
      get suit() {
        return this.getProp("suit")
      }
      set suit(value) {
        this.setProp("suit", value)
      }
      get face_up() {
        return this.getProp("face_up")
      }
      set face_up(value) {
        this.setProp("face_up", value)
      }
      turn_over() {
        this.face_up = !this.face_up
      }
      draw(): ReturnType<Drawable["draw"]> {
        const text = () => (this.face_up ? `${this.rank} of ${this.suit}` : "back")
        return (h("span", { class: "face" }, text) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Ace2.declareProp("rank", { oneOf: ["ace", 2, 3, 12] })
    Ace2.declareProp("suit", { type: "text" })
    Ace2.declareProp("face_up", { type: "choice" })
    /** A pile of them. */
    class Stack2 extends DrawableList<Ace2> {
      static elementTag = spellCore.defineElement(this, "Plain")
      static instanceType = Ace2
    }

    test("a plain page writes <plain-stack><plain-ace2 rank=... suit=...>:  each makes its own thing and draws it", async () => {
      await Promise.resolve()
      expect(Stack2.elementTag).toBe("plain-stack2")
      const stack = await ElementFixture.render<HTMLElement>(
        '<plain-stack2><plain-ace2 rank="ace" suit="spades" face-up></plain-ace2></plain-stack2>'
      )
      await ElementFixture.settle(stack)
      spellCore.flush()
      flush()
      const card = stack.firstElementChild as HTMLElement & {
        rank: unknown
        faceUp: boolean
        turnOver(): void
        component?: { currentThing?: Ace2 }
      }
      expect(card.shadowRoot!.querySelector(".face")!.textContent).toBe("ace of spades")
      expect(stack.shadowRoot!.querySelector("slot")).not.toBeNull()

      // a legal value given as text is the value:  "2" is 2
      card.rank = "2"
      spellCore.flush()
      flush()
      expect(card.component!.currentThing!.rank).toBe(2)
      expect(card.shadowRoot!.querySelector(".face")!.textContent).toBe("2 of spades")

      card.turnOver()
      spellCore.flush()
      flush()
      expect(card.shadowRoot!.querySelector(".face")!.textContent).toBe("back")
    })
  })
})
