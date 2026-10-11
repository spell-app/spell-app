import { describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import h from "@solidjs/h"

import { spellCore, App, Drawable, DrawableList } from "$/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { installSpellElements, SpellElement } from "./SpellElement"

import "$/app/solid/cellsBridge"

/**
 * A drawable thing's own element (epic `drawable-thing`, P3).
 * - A project's last line defines its drawable classes' elements,
 *   and each draws its `thing` in its own shadow root, as a Spell UI element does.
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

  describe("the element and its thing agree, both ways (P13)", () => {
    /** A card:  its rank (one of ace, 2, 3, 12), suit, direction (up or down) and whether it's marked. */
    class Deuce extends Drawable {
      static elementTag = spellCore.defineElement(this, "Agree")
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
      get direction() {
        return this.getProp("direction")
      }
      set direction(value) {
        this.setProp("direction", value)
      }
      get marked() {
        return this.getProp("marked")
      }
      set marked(value) {
        this.setProp("marked", value)
      }
      turn_over() {
        this.direction = this.direction === "up" ? "down" : "up"
      }
      draw(): ReturnType<Drawable["draw"]> {
        const text = () => (this.direction === "up" ? `${this.rank} of ${this.suit}` : "back")
        return (h("span", { class: "face" }, text) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Deuce.declareProp("rank", { oneOf: ["ace", 2, 3, 12] })
    Deuce.declareProp("suit", { type: "text" })
    Deuce.declareProp("direction", { oneOf: ["up", "down"] })
    Deuce.declareProp("marked", { type: "choice" })

    /** A card's element, as a page's script sees it. */
    type CardElement = HTMLElement & {
      rank: unknown
      direction: unknown
      turnOver(): void
      component?: { currentThing?: Deuce }
    }

    /** Let the thing's and Solid's changes run. */
    function settle() {
      spellCore.flush()
      flush()
    }

    /** The attribute changes `element` hears while `act()` runs, as `name=value`, in order. */
    function attributeChangesDuring(element: HTMLElement, act: () => void): string[] {
      const observer = new MutationObserver(() => {})
      observer.observe(element, { attributes: true })
      act()
      return observer
        .takeRecords()
        .map((record) => `${record.attributeName}=${element.getAttribute(record.attributeName!)}`)
    }

    test("ace.turnOver() sets direction on the tag;  reading ace.direction gives the thing's, at once", async () => {
      const ace = await ElementFixture.render<CardElement>(
        '<agree-deuce rank="ace" suit="spades" direction="up"></agree-deuce>'
      )
      await ElementFixture.settle(ace)
      settle()
      const thing = ace.component!.currentThing!
      // the tag's attributes won:  the thing it made took them
      expect([thing.rank, thing.suit, thing.direction]).toEqual(["ace", "spades", "up"])
      expect(ace.shadowRoot!.querySelector(".face")!.textContent).toBe("ace of spades")

      const changes = attributeChangesDuring(ace, () => {
        ace.turnOver()
        expect(ace.direction).toBe("down")
        settle()
      })
      expect(ace.getAttribute("direction")).toBe("down")
      expect(ace.shadowRoot!.querySelector(".face")!.textContent).toBe("back")
      // written once, never bounced back
      expect(changes).toEqual(["direction=down"])
    })

    test("setting the attribute still writes the thing and redraws;  a number reads back as the number", async () => {
      const ace = await ElementFixture.render<CardElement>(
        '<agree-deuce rank="ace" suit="spades" direction="up"></agree-deuce>'
      )
      await ElementFixture.settle(ace)
      settle()
      const thing = ace.component!.currentThing!
      const writes = vi.spyOn(thing, "setProp")

      const changes = attributeChangesDuring(ace, () => {
        ace.setAttribute("rank", "2")
        expect(thing.rank).toBe(2)
        expect(ace.rank).toBe(2)
        settle()
      })
      expect(ace.shadowRoot!.querySelector(".face")!.textContent).toBe("2 of spades")
      expect(changes).toEqual(["rank=2"])
      expect(writes.mock.calls).toEqual([["rank", 2]])

      ace.rank = 12
      settle()
      expect(ace.getAttribute("rank")).toBe("12")
      expect(thing.rank).toBe(12)
    })

    test("a yes / no property is its attribute there or not;  nothing is no attribute", async () => {
      const card = await ElementFixture.render<CardElement>('<agree-deuce rank="3"></agree-deuce>')
      await ElementFixture.settle(card)
      settle()
      const thing = card.component!.currentThing!
      expect(card.hasAttribute("suit")).toBe(false)
      expect(card.hasAttribute("marked")).toBe(false)

      thing.marked = true
      settle()
      expect(card.getAttribute("marked")).toBe("")
      thing.marked = false
      settle()
      expect(card.hasAttribute("marked")).toBe(false)

      thing.suit = "hearts"
      settle()
      expect(card.getAttribute("suit")).toBe("hearts")
      card.removeAttribute("suit")
      expect(thing.suit).toBeUndefined()
    })

    test("a card the program draws shows its thing's values as attributes, and they follow it", async () => {
      /** Two cards on a table. */
      class Felt extends App {
        cards = [new Deuce({ rank: 2, suit: "clubs", direction: "down", marked: false }), new Deuce({ rank: "ace" })]
        draw(): ReturnType<Drawable["draw"]> {
          const children = this.cards.map((card) => () => spellCore.drawThing(card))
          return (h("div", {}, ...children) as unknown as () => ReturnType<Drawable["draw"]>)()
        }
      }
      const felt = new Felt()
      const root = document.createElement("div")
      document.body.append(root)
      spellCore.mountApp(felt, root)
      flush()
      await ElementFixture.settle(root)
      settle()
      const [first, second] = [...root.querySelectorAll<CardElement>("agree-deuce")]
      expect(["rank", "suit", "direction"].map((name) => first!.getAttribute(name))).toEqual(["2", "clubs", "down"])
      expect(first!.hasAttribute("marked")).toBe(false)
      expect(second!.getAttribute("rank")).toBe("ace")
      expect(second!.hasAttribute("suit")).toBe(false)
      // the element's empty values were never written to the thing it was handed
      expect(felt.cards[1]!.marked).toBeUndefined()

      felt.cards[0]!.turn_over()
      settle()
      expect(first!.getAttribute("direction")).toBe("up")
      root.remove()
    })
  })

  describe("thing references:  Type#name, Type#1, an attribute holding a thing (P18)", () => {
    /** A chip:  drawn as its label;  its home a stack, declared;  the stack holding it, worked out. */
    class Chip extends Drawable {
      static elementTag = spellCore.defineElement(this, "Drawable Board")
      get label() {
        return this.getProp("label")
      }
      set label(value) {
        this.setProp("label", value)
      }
      get home() {
        return this.getProp("home")
      }
      set home(value) {
        this.setProp("home", value)
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("i", {}, () => `${this.label}`) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Chip.declareProp("label", { type: "text" })
    Chip.declareProp("home", { type: "Stack" })
    /** A stack of chips, each in one stack at a time:  drawn as its name. */
    class Stack extends DrawableList<Chip> {
      static elementTag = spellCore.defineElement(this, "Drawable Board")
      static instanceType = Chip
      get name() {
        return this.getProp("name")
      }
      set name(value) {
        this.setProp("name", value)
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("b", {}, () => `${this.name}`) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Stack.declareProp("name", { type: "text" })
    Stack.exclusive = true
    // `a chip belongs to one stack`, as spell compiles it
    Object.defineProperty(Chip.prototype, "stack", {
      get(this: Chip) {
        return Stack.ownerOf(this)
      },
      configurable: true
    })
    /** A column is a stack. */
    class Column extends Stack {
      static elementTag = spellCore.defineElement(this, "Drawable Board")
    }
    /** A stack that takes nothing. */
    class Locked extends Stack {
      static elementTag = spellCore.defineElement(this, "Drawable Board")
      canTake() {
        return false
      }
    }
    // the program's things, made before its tags are defined, as a program's are;
    // kept, as a program keeps them:  the registry holds things weakly
    const c1 = new Column({ name: "C1" })
    const c2 = new Column({ name: "C2" })
    const l1 = new Locked({ name: "L1" })

    /** A chip's element, as a page's script sees it. */
    type ChipElement = HTMLElement & { stack: unknown; home: unknown; component?: { currentThing?: Chip } }

    /** Let the things' and Solid's changes run. */
    function settle() {
      spellCore.flush()
      flush()
    }

    test("the tag leaves the project's word drawable out:  <board-column>", () => {
      expect(customElements.get("board-column")).toBeDefined()
      expect(customElements.get("drawable-board-column")).toBeUndefined()
    })

    test("thing=Column#C1, Column#1 and Stack#C1 each find the column C1;  one that finds nothing says so", async () => {
      const root = await ElementFixture.render<HTMLElement>(
        "<div>" +
          '<board-column thing="Column#C1"></board-column>' +
          '<board-column thing="Column#1"></board-column>' +
          '<board-stack thing="Stack#C1"></board-stack>' +
          '<board-column thing="Column#2"></board-column>' +
          '<board-column thing="Column#C9"></board-column>' +
          "</div>"
      )
      await ElementFixture.settle(root)
      settle()
      const drawn = [...root.children].map((element) => element.shadowRoot?.textContent)
      expect(drawn).toEqual(["C1", "C1", "C1", "C2", "⚠ no Column#C9"])
      const things = [...root.children].map((element) => SpellElement.thingOf(element))
      expect(things.slice(0, 3)).toEqual([c1, c1, c1])
    })

    test("a chip's stack shows as that stack's reference and follows it;  setting it moves the chip, if the stack takes it", async () => {
      const chip = await ElementFixture.render<ChipElement>('<board-chip label="red"></board-chip>')
      await ElementFixture.settle(chip)
      settle()
      const thing = chip.component!.currentThing!
      expect(chip.hasAttribute("stack")).toBe(false)

      chip.setAttribute("stack", "Column#C1")
      settle()
      expect(Stack.ownerOf(thing)).toBe(c1)
      expect(chip.stack).toBe("Column#C1")

      spellCore.move(thing, c2)
      settle()
      expect(chip.getAttribute("stack")).toBe("Column#C2")

      // a stack that won't take it:  it stays, and the attribute says where it is
      chip.setAttribute("stack", "Locked#L1")
      settle()
      expect(Stack.ownerOf(thing)).toBe(c2)
      expect(l1.items).toEqual([])
      expect(chip.getAttribute("stack")).toBe("Column#C2")

      // the stack itself, as a page's script might hand it over
      chip.stack = c1
      settle()
      expect(Stack.ownerOf(thing)).toBe(c1)
      expect(chip.getAttribute("stack")).toBe("Column#C1")
    })

    test("a property declared as a thing:  its attribute is the thing's reference, both ways", async () => {
      const chip = await ElementFixture.render<ChipElement>('<board-chip label="blue" home="Stack#C2"></board-chip>')
      await ElementFixture.settle(chip)
      settle()
      const thing = chip.component!.currentThing!
      // the tag's attribute won:  the thing it made took the column it names
      expect(thing.home).toBe(c2)

      thing.home = c1
      settle()
      expect(chip.getAttribute("home")).toBe("Column#C1")
      expect(chip.home).toBe("Column#C1")

      chip.removeAttribute("home")
      expect(thing.home).toBeUndefined()
    })
  })
})
