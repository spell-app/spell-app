import { describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import h from "@solidjs/h"

import { core, App, Drawable, DrawableList, Thing } from "spell-lang/core"
import { P } from "spell-lang/parser"
import { E } from "spell-ui/core"
import { RootLoader } from "spell-ui/components/ui-root"
import { ElementFixture } from "spell-kit/test-helpers/ElementFixture"
import { installSpellElements, SpellElement } from "spell-app/app/runner/SpellElement"

import "spell-app/app/solid/cellsBridge"

/**
 * A drawable thing's own element (epic `drawable-thing`, P3).
 * - A project's last line defines its drawable classes' elements,
 *   and each draws its `thing` in its own shadow root, as a Spell UI element does.
 */
describe("SpellElement", () => {
  installSpellElements(core)

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
    core.defineElement(Card, "Solitaire")
    await Promise.resolve()
    expect(customElements.get("solitaire-card")).toBeDefined()
  })

  test("the element draws its thing, live, in its own shadow root, with the page's styles", async () => {
    core.defineElement(Card, "Solitaire")
    await Promise.resolve()
    const card = new Card()
    card.rank = "ace"
    const element = await ElementFixture.render<HTMLElement & { thing?: Card }>("<solitaire-card></solitaire-card>")
    element.thing = card
    flush()
    expect(element.shadowRoot!.querySelector(".rank")?.textContent).toBe("ace")
    expect(element.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0)

    card.rank = "king"
    core.flush()
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
    core.defineElement(Note, "Note")
    core.defineElement(Memo, "Note")
    await Promise.resolve()
    const element = await ElementFixture.render<HTMLElement & { thing?: Memo }>("<note-memo></note-memo>")
    element.thing = new Memo()
    flush()
    const note = element.shadowRoot!.querySelector(".note")!
    expect(getComputedStyle(note).color).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(note).backgroundColor).toBe("rgb(4, 5, 6)")
  })

  test("loads the Spell UI families its drawing uses, a Spanish program's <es-*> tags and values too (J96)", async () => {
    // what the runner does for a Spanish program, before it runs it
    await RootLoader.useLanguage("es")
    /** A Spanish card:  its own colour words, as Spell UI's Spanish tag takes them. */
    class Carta extends Drawable {
      color = "rojo"
      draw(): ReturnType<Drawable["draw"]> {
        const text = h("es-texto", { tamano: "gigante", "prop:color": () => this.color }, "🂱")
        return (text as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    core.defineElement(Carta, "Solitario")
    await Promise.resolve()
    const element = await ElementFixture.render<HTMLElement & { thing?: Carta }>("<solitario-carta></solitario-carta>")
    element.thing = new Carta()
    flush()
    // nothing but the card loads `<ui-text>`'s family:  the card's shadow root is no root's content
    await customElements.whenDefined("es-texto")
    const texto = element.shadowRoot!.querySelector("es-texto") as E.DOMElement
    await texto.ready
    await ElementFixture.settle()
    expect(texto.shadowRoot!.querySelector("span")!.className).toBe("ui massive red text")
  })

  test("defining it again, as a program run again does, keeps the tag", () => {
    const defined = customElements.get("solitaire-card")
    core.defineElement(Card, "Solitaire")
    expect(customElements.get("solitaire-card")).toBe(defined)
  })

  describe("a program draws a drawable thing as its element (P5)", () => {
    /** A card that draws its rank as a button, counting its clicks;  a rank of `bad` throws. */
    class Ace extends Drawable {
      static elementTag = core.defineElement(this, "Game")
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
        const children = this.cards.map((card) => () => core.drawThing(card))
        return (h("div", { class: "table" }, ...children) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }

    test("each card is its own element;  one that can't draw shows its own error;  a change redraws only its card", async () => {
      const table = new Table()
      table.cards[0]!.rank = "ace"
      table.cards[1]!.rank = "bad"
      const root = document.createElement("div")
      document.body.append(root)
      core.mountApp(table, root)
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
      core.flush()
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
      static elementTag = core.defineElement(this, "Game")
      constructor(public label = "") {
        super()
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("b", {}, this.label) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    /** A pile:  its outside a box around its slot. */
    class Heap extends DrawableList<Chip> {
      static elementTag = core.defineElement(this, "Game")
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
        const heaps = [() => core.drawThing(this.left), () => core.drawThing(this.right)]
        return (h("div", {}, ...heaps) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }

    test("<game-heap> holds <game-chip>s, shown through its frame's slot;  a chip moved moves to the other heap", async () => {
      const board = new Board()
      const [a, b] = [new Chip("a"), new Chip("b")]
      core.append(board.left, a)
      core.append(board.left, b)
      const root = document.createElement("div")
      document.body.append(root)
      core.mountApp(board, root)
      flush()
      const [left, right] = [...root.querySelectorAll("game-heap")] as HTMLElement[]
      await ElementFixture.settle(root)
      const labels = (heap: HTMLElement) =>
        [...heap.children].map((chip) => `${chip.localName} ${chip.shadowRoot?.textContent}`)
      expect(labels(left!)).toEqual(["game-chip a", "game-chip b"])
      expect(left!.shadowRoot!.querySelector(".heap slot")).not.toBeNull()
      expect((left!.children[0] as HTMLElement).assignedSlot).toBe(left!.shadowRoot!.querySelector("slot"))

      core.remove(board.left, a)
      core.append(board.right, a)
      core.flush()
      await ElementFixture.settle(root)
      expect(labels(left!)).toEqual(["game-chip b"])
      expect(labels(right!)).toEqual(["game-chip a"])
      root.remove()
    })

    /** A heap with no drawing of its own:  its wrapper just the slot, each chip as itself. */
    class Bare extends DrawableList<Chip> {
      static elementTag = core.defineElement(this, "Game")
      static instanceType = Chip
    }
    /** A heap that draws each chip in a spot of its own (`to draw each item`). */
    class Spots extends DrawableList<Chip> {
      static elementTag = core.defineElement(this, "Game")
      static instanceType = Chip
      drawEachItem(chip: Chip): ReturnType<Drawable["draw"]> {
        const spot = h("div", { class: "spot" }, () => core.drawThing(chip))
        return (spot as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }

    test("by default its wrapper is just its slot;  `to draw each item` puts each chip in a spot, as its children (P20)", async () => {
      const [bare, spots] = [new Bare(), new Spots()]
      core.append(bare, new Chip("a"))
      core.append(spots, new Chip("b"))
      const root = document.createElement("div")
      document.body.append(root)
      const dispose = core.mountApp({ draw: () => [core.drawThing(bare), core.drawThing(spots)] }, root)
      flush()
      await ElementFixture.settle(root)
      const [bareElement, spotsElement] = [root.querySelector("game-bare")!, root.querySelector("game-spots")!]
      expect(bareElement.shadowRoot!.innerHTML).toContain("<slot></slot>")
      expect([...bareElement.children].map((child) => child.localName)).toEqual(["game-chip"])
      expect([...spotsElement.children].map((child) => child.outerHTML)).toEqual([
        expect.stringMatching(/^<div class="spot"[^>]*><game-chip[^>]*><\/game-chip><\/div>$/)
      ])
      dispose.unmount()
      root.remove()
    })

    /** A heap of a family:  a chip is in one pot at a time, so putting it in another MOVES it. */
    class Pot extends DrawableList<Chip> {
      static elementTag = core.defineElement(this, "Game")
      static instanceType = Chip
      static exclusive = true
    }

    /** `pots` drawn side by side, apart, in a new root on the page:  returns the root and how to take it down. */
    async function drawPots(...pots: Pot[]) {
      const root = document.createElement("div")
      root.style.cssText = "display: flex; gap: 50px"
      document.body.append(root)
      const mounted = core.mountApp({ draw: () => pots.map((pot) => core.drawThing(pot)) }, root)
      flush()
      await ElementFixture.settle(root)
      return { root, done: () => (mounted.unmount(), root.remove()) }
    }

    test("numbers its children for CSS:  each one's --index from 0, its own --count;  again as they change (outline-spell P27)", async () => {
      const pot = new Pot()
      core.append(pot, new Chip("a"), new Chip("b"))
      const { root, done } = await drawPots(pot)
      const element = root.querySelector("game-pot") as HTMLElement
      const indexes = () => [...element.children].map((chip) => (chip as HTMLElement).style.getPropertyValue("--index"))
      expect(indexes()).toEqual(["0", "1"])
      expect(element.style.getPropertyValue("--count")).toBe("2")

      core.append(pot, new Chip("c"))
      core.flush()
      await ElementFixture.settle(root)
      expect(indexes()).toEqual(["0", "1", "2"])
      expect(element.style.getPropertyValue("--count")).toBe("3")
      // a chip numbers no children of its own:  it would hide its pot's --count
      expect((element.children[0] as HTMLElement).style.getPropertyValue("--count")).toBe("")
      done()
    })

    /**
     * Drag `element` from its middle to `target`'s, with pointer events, as a finger does.
     * - `before`:  what to check over the target, before the pointer's let go.
     */
    async function drag(element: HTMLElement, target: HTMLElement, before?: () => void) {
      const at = (box: HTMLElement) => {
        const rect = box.getBoundingClientRect()
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
      }
      const [from, to] = [at(element), at(target)]
      const send = (on: EventTarget, type: string, { x, y }: { x: number; y: number }) =>
        on.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            composed: true,
            pointerId: 3,
            pointerType: "touch",
            clientX: x,
            clientY: y
          })
        )
      send(element, "pointerdown", from)
      for (const step of [0.25, 0.5, 0.75, 1]) {
        send(window, "pointermove", { x: from.x + (to.x - from.x) * step, y: from.y + (to.y - from.y) * step })
      }
      if (before) {
        // the page's states, as the browser draws them
        core.flush()
        await ElementFixture.settle(document.body)
        before()
      }
      send(window, "pointerup", to)
      core.flush()
      // the dragged element is gone once its thing moves:  drawn again in its new list
      await ElementFixture.settle(document.body)
      // a task:  the drag stops swallowing the click its let-go makes, which a synthetic one never does
      await new Promise((resolve) => setTimeout(resolve))
    }

    // a tray of tokens, each in one tray at a time, as `a token belongs to one tray` compiles:  made before any token
    // is drawn, so the token's tag knows its `tray` (`core.elementApiOf()`)
    /** A list of a family:  dragging a token from one to another moves it. */
    class Tray extends DrawableList<Token> {
      static elementTag = core.defineElement(this, "Game")
      static exclusive = true
      // `a tray can be dropped on`
      static canBeDroppedOn = true
    }
    const trays = [new Tray(), new Tray()]
    /** A token, drawn as its label;  its tray is the one holding it. */
    class Token extends Drawable {
      static elementTag = core.defineElement(this, "Game")
      // `a token can be dragged`
      static canBeDragged = true
      constructor(public label = "") {
        super()
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("b", {}, this.label) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Object.defineProperty(Token.prototype, "tray", {
      get(this: Token) {
        return Tray.ownerOf(this)
      },
      configurable: true
    })
    Object.assign(Tray, { instanceType: Token })
    /** A token whose type never says `can be dragged`. */
    class Pebble extends Token {
      static elementTag = core.defineElement(this, "Game")
      static canBeDragged = false
    }

    /** `trays`, drawn side by side, big enough to drop on even empty:  returns the root and how to take it down. */
    async function drawTrays() {
      const root = document.createElement("div")
      root.style.cssText = "display: flex; gap: 50px"
      root.innerHTML = "<style>game-tray { display: block; min-width: 60px; min-height: 30px }</style>"
      document.body.append(root)
      const mounted = core.mountApp({ draw: () => trays.map((tray) => core.drawThing(tray)) }, root)
      flush()
      await ElementFixture.settle(root)
      return { root, done: () => (mounted.unmount(), root.remove(), trays.forEach((tray) => tray.clear())) }
    }

    test("a token its tray gives up can be dragged to another tray:  it moves there, by the trays' rules (outline-spell P28)", async () => {
      const token = new Token("a")
      core.append(trays[0]!, token)
      const { root, done } = await drawTrays()
      const element = root.querySelector("game-token") as HTMLElement
      expect(element.matches(":state(draggable)")).toBe(true)
      await drag(element, root.querySelectorAll<HTMLElement>("game-tray")[1]!)
      // nobody listens for token-drop:  it moved, as the trays' rules let it
      expect([...trays[1]!.items]).toEqual([token])
      done()
    })

    test("the program hears <thing>-drop, with the thing and the list it landed on, by each of its types (outline-spell P28)", async () => {
      const token = new Token("a")
      core.append(trays[0]!, token)
      const { root, done } = await drawTrays()
      // what the program hears:  a handler answers, so the page leaves the move to it
      const heard: Array<[unknown, Record<string, unknown>]> = []
      const trigger = vi.spyOn(core, "trigger").mockImplementation((event, details) => {
        heard.push([event, details as Record<string, unknown>])
        return [true]
      })
      try {
        await drag(root.querySelector("game-token") as HTMLElement, root.querySelectorAll<HTMLElement>("game-tray")[1]!)
        expect(heard).toHaveLength(1)
        expect(heard[0]![0]).toBe("token-drop")
        expect(heard[0]![1]).toMatchObject({ token, tray: trays[1] })
        // the program decides:  it didn't move it
        expect([...trays[0]!.items]).toEqual([token])
      } finally {
        trigger.mockRestore()
        done()
      }
    })

    test("the tray under a token it would take glows;  the web's own drag events say so (outline-spell P28)", async () => {
      const token = new Token("a")
      core.append(trays[0]!, token)
      const { root, done } = await drawTrays()
      const element = root.querySelector("game-token") as HTMLElement
      const [from, to] = [...root.querySelectorAll<HTMLElement>("game-tray")] as [HTMLElement, HTMLElement]
      const heard: string[] = []
      for (const type of ["dragstart", "dragend"]) element.addEventListener(type, (event) => heard.push(event.type))
      for (const type of ["dragenter", "drop"]) to.addEventListener(type, (event) => heard.push(`tray ${event.type}`))
      await drag(element, to, () => {
        expect(to.matches(":state(accepting-drop)")).toBe(true)
        expect(from.matches(":state(accepting-drop)")).toBe(false)
        expect(element.matches(":state(dragging)")).toBe(true)
      })
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(to.matches(":state(accepting-drop)")).toBe(false)
      expect(heard).toEqual(["dragstart", "tray dragenter", "tray drop", "dragend"])
      done()
    })

    test("a tray's own handlers hear a token come over it and land:  `dropped on it` takes the place of <thing>-drop (outline-spell P28)", async () => {
      /** A token of a sub-type:  its tray's `when a token ...` handlers run for it too. */
      class Coin extends Token {
        static elementTag = core.defineElement(this, "Game")
      }
      const coin = new Coin("a")
      core.append(trays[0]!, coin)
      const { root, done } = await drawTrays()
      // `- when a token is dragged over it:` ... as compiled, on the tray
      const heard: string[] = []
      const to = trays[1]! as Tray & Record<string, unknown>
      to.whenTokenDraggedOver = (token: Token) => heard.push(`over ${token.label}`)
      to.whenTokenDraggedOutOf = (token: Token) => heard.push(`out of ${token.label}`)
      to.whenTokenDroppedOn = (token: Token) => heard.push(`dropped ${token.label}`)
      const trigger = vi.spyOn(core, "trigger")
      try {
        await drag(root.querySelector("game-coin") as HTMLElement, root.querySelectorAll<HTMLElement>("game-tray")[1]!)
        expect(heard).toEqual(["over a", "dropped a"])
        // its handler answered:  no `coin-drop`, and the move is the handler's to make
        expect(trigger).not.toHaveBeenCalled()
        expect([...trays[0]!.items]).toEqual([coin])
      } finally {
        trigger.mockRestore()
        for (const name of ["whenTokenDraggedOver", "whenTokenDraggedOutOf", "whenTokenDroppedOn"]) delete to[name]
        done()
      }
    })

    test("a drop a tray won't take runs its `dragged out of it`, and a handler that throws goes to the console (outline-spell P28)", async () => {
      const token = new Token("a")
      core.append(trays[0]!, token)
      const { root, done } = await drawTrays()
      const heard: string[] = []
      const to = trays[1]! as Tray & Record<string, unknown>
      to.canTake = () => false
      to.whenTokenDraggedOver = () => {
        heard.push("over")
        throw new Error("oops")
      }
      to.whenTokenDraggedOutOf = () => heard.push("out of")
      to.whenTokenDroppedOn = () => heard.push("dropped")
      const error = vi.spyOn(core.console, "error").mockImplementation(() => {})
      try {
        await drag(root.querySelector("game-token") as HTMLElement, root.querySelectorAll<HTMLElement>("game-tray")[1]!)
        expect(heard).toEqual(["over", "out of"])
        expect(error).toHaveBeenCalledWith(expect.objectContaining({ message: "oops" }))
        expect([...trays[0]!.items]).toEqual([token])
      } finally {
        error.mockRestore()
        for (const name of ["canTake", "whenTokenDraggedOver", "whenTokenDraggedOutOf", "whenTokenDroppedOn"])
          delete to[name]
        done()
      }
    })

    test("a tray's `while a token is dragged over it` sets what goes back as the token lands (outline-spell P28)", async () => {
      const token = new Token("a")
      core.append(trays[0]!, token)
      const { root, done } = await drawTrays()
      /** What the handler sets:  a prop, as compiled spell's are. */
      class Sign extends Thing {
        get hint(): string {
          return this.getProp("hint") ?? ""
        }
        set hint(value: string) {
          this.setProp("hint", value)
        }
      }
      const sign = new Sign()
      const to = trays[1]! as Tray & Record<string, unknown>
      // `- while something is dragged over it:` too, but a token's own runs instead
      to.whileThingDraggedOver = () => (sign.hint = "not this one")
      to.whileTokenDraggedOver = (dragged: Token) => (sign.hint = `drop ${dragged.label} here`)
      try {
        await drag(
          root.querySelector("game-token") as HTMLElement,
          root.querySelectorAll<HTMLElement>("game-tray")[1]!,
          () => expect(sign.hint).toBe("drop a here")
        )
        expect(sign.hint).toBe("")
        expect([...trays[1]!.items]).toEqual([token])
      } finally {
        for (const name of ["whileThingDraggedOver", "whileTokenDraggedOver"]) delete to[name]
        done()
      }
    })

    test("a click selects a thing in its list;  command adds or takes one away, shift selects a range (outline-spell P29)", async () => {
      /** A token people may select:  `a bead can be selected`. */
      class Bead extends Token {
        static elementTag = core.defineElement(this, "Game")
        static canBeSelected = true
      }
      const beads = ["a", "b", "c", "d"].map((label) => new Bead(label))
      core.append(trays[0]!, ...beads)
      const pebble = new Pebble("e")
      core.append(trays[0]!, pebble)
      const { root, done } = await drawTrays()
      const elements = [...root.querySelectorAll<HTMLElement>("game-bead")]
      const click = async (element: HTMLElement, keys: MouseEventInit = {}) => {
        element.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, ...keys }))
        core.flush()
        await ElementFixture.settle(root)
      }
      const selected = () => [...trays[0]!.selection].map((bead) => (bead as Token).label)
      try {
        await click(elements[1]!)
        expect(selected()).toEqual(["b"])
        expect(elements[1]!.matches(":state(selected)")).toBe(true)
        await click(elements[3]!, { metaKey: true })
        expect(selected()).toEqual(["b", "d"])
        await click(elements[1]!, { ctrlKey: true })
        expect(selected()).toEqual(["d"])
        expect(elements[1]!.matches(":state(selected)")).toBe(false)
        // from the last one clicked, b, to a:  in the list's order
        await click(elements[0]!, { shiftKey: true })
        expect(selected()).toEqual(["a", "b"])
        // a thing whose type doesn't say `can be selected`:  its click selects nothing
        await click(root.querySelector("game-pebble") as HTMLElement)
        expect(selected()).toEqual(["a", "b"])
        // taken out of the list, it leaves the selection
        core.remove(trays[0]!, beads[0])
        expect(selected()).toEqual(["b"])
      } finally {
        done()
      }
    })

    test("dragging is opt-in:  a thing whose type doesn't say `can be dragged` can't be dragged (outline-spell P28)", async () => {
      core.append(trays[0]!, new Token("a"), new Pebble("b"))
      const { root, done } = await drawTrays()
      expect((root.querySelector("game-token") as HTMLElement).matches(":state(draggable)")).toBe(true)
      expect((root.querySelector("game-pebble") as HTMLElement).matches(":state(draggable)")).toBe(false)
      done()
    })

    test("a chip its pot won't give up can't be dragged (outline-spell P28)", async () => {
      /** A pot that never lets a chip go. */
      class Jar extends Pot {
        static elementTag = core.defineElement(this, "Game")
        canGiveUp() {
          return false
        }
      }
      const jar = new Jar()
      core.append(jar, new Chip("a"))
      const { root, done } = await drawPots(jar)
      expect((root.querySelector("game-chip") as HTMLElement).matches(":state(draggable)")).toBe(false)
      done()
    })

    /** A column whose chits people may reorder:  `- its items can be reordered`, waiting a tenth of a second. */
    class Column extends DrawableList<Chit> {
      static elementTag = core.defineElement(this, "Game")
      static exclusive = true
      static reorderItemsAfter = 0.1
    }
    /** A chit, drawn as its label and a field:  `a chit can be dragged`, `can be selected`. */
    class Chit extends Drawable {
      static elementTag = core.defineElement(this, "Game")
      static canBeDragged = true
      static canBeSelected = true
      constructor(public label = "") {
        super()
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (
          h("b", {}, this.label, h("input", { "aria-label": "field" })) as unknown as () => ReturnType<Drawable["draw"]>
        )()
      }
    }
    Object.defineProperty(Chit.prototype, "column", {
      get(this: Chit) {
        return Column.ownerOf(this)
      },
      configurable: true
    })
    Object.assign(Column, { instanceType: Chit })

    /** A column of chits `labels`, drawn down the page:  returns it, its element, its chits' elements, and the end. */
    async function drawColumn(...labels: string[]) {
      const column = new Column()
      core.append(column, ...labels.map((label) => new Chit(label)))
      const root = document.createElement("div")
      root.innerHTML = `<style>
        game-column { display: flex; flex-direction: column; width: 120px; padding-bottom: 30px }
        game-chit { display: block; height: 24px }
      </style>`
      document.body.append(root)
      const mounted = core.mountApp({ draw: () => core.drawThing(column) }, root)
      flush()
      await ElementFixture.settle(root)
      const element = root.querySelector("game-column") as HTMLElement
      const chits = () => [...root.querySelectorAll<HTMLElement>("game-chit")]
      const labelsNow = () => [...column].map((chit) => chit.label)
      return { column, element, chits, labelsNow, done: () => (mounted.unmount(), root.remove()) }
    }

    /** Press `element`, then move the pointer to (`x`, `y`) in steps:  a drag under way;  returns how to let go there. */
    function pressAndMove(element: Element, x: number, y: number, on: Element = element) {
      const box = element.getBoundingClientRect()
      const from = { x: box.x + 10, y: box.y + box.height / 2 }
      const send = (target: EventTarget, type: string, at: { x: number; y: number }) =>
        target.dispatchEvent(
          new PointerEvent(type, { bubbles: true, composed: true, pointerId: 4, clientX: at.x, clientY: at.y })
        )
      send(on, "pointerdown", from)
      for (const step of [0.25, 0.5, 0.75, 1]) {
        send(window, "pointermove", { x: from.x + (x - from.x) * step, y: from.y + (y - from.y) * step })
      }
      return async () => {
        send(window, "pointerup", { x, y })
        core.flush()
        await ElementFixture.settle(document.body)
        // the drag ends just before the next paint (`dragend`);  then a task, so it stops swallowing the click
        await new Promise((resolve) => requestAnimationFrame(resolve))
        await new Promise((resolve) => setTimeout(resolve))
      }
    }

    test("a reordered list:  the dragged item dims, a line shows where it goes, and the drop puts it there (outline-spell P30)", async () => {
      const { element, chits, labelsNow, done } = await drawColumn("a", "b", "c")
      try {
        const [a, , c] = chits()
        const below = c!.getBoundingClientRect().bottom + 5
        const letGo = pressAndMove(a!, a!.getBoundingClientRect().x + 10, below)
        core.flush()
        await ElementFixture.settle(element)
        expect(a!.matches(":state(lifted)")).toBe(true)
        expect(element.matches(":state(placing)")).toBe(true)
        expect(element.shadowRoot!.querySelector("[part~=drop-line]")).not.toBeNull()
        // dragged where it is:  it never follows the pointer
        expect(a!.style.translate).toBe("")
        await letGo()
        expect(labelsNow()).toEqual(["b", "c", "a"])
        expect(element.matches(":state(placing)")).toBe(false)
        expect(chits().some((chit) => chit.matches(":state(lifted)"))).toBe(false)
      } finally {
        done()
      }
    })

    test("the pointer resting on a place:  the items move there while the drag goes on;  `move-delay` says how long (outline-spell P30)", async () => {
      const { element, chits, labelsNow, done } = await drawColumn("a", "b", "c")
      try {
        element.setAttribute("move-delay", "0.05")
        const [, b, c] = chits()
        const letGo = pressAndMove(c!, c!.getBoundingClientRect().x + 10, b!.getBoundingClientRect().top + 2)
        await new Promise((resolve) => setTimeout(resolve, 150))
        core.flush()
        expect(labelsNow()).toEqual(["a", "c", "b"])
        await letGo()
        expect(labelsNow()).toEqual(["a", "c", "b"])
      } finally {
        done()
      }
    })

    test("selected items drag together;  a press in a field inside one starts no drag (outline-spell P30)", async () => {
      const { element, chits, labelsNow, done } = await drawColumn("a", "b", "c", "d")
      try {
        const [a, , c, d] = chits()
        const click = (chit: HTMLElement, keys: MouseEventInit = {}) =>
          chit.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, ...keys }))
        click(a!)
        click(c!, { metaKey: true })
        core.flush()
        await ElementFixture.settle(element)
        const letGo = pressAndMove(a!, a!.getBoundingClientRect().x + 10, d!.getBoundingClientRect().bottom + 5)
        await letGo()
        expect(labelsNow()).toEqual(["b", "d", "a", "c"])
        // the field:  its press is the field's
        const [, , , last] = chits()
        const field = last!.shadowRoot!.querySelector("input")!
        const release = pressAndMove(
          last!,
          last!.getBoundingClientRect().x + 10,
          chits()[0]!.getBoundingClientRect().top,
          field
        )
        expect(last!.matches(":state(dragging)")).toBe(false)
        await release()
        expect(labelsNow()).toEqual(["b", "d", "a", "c"])
      } finally {
        done()
      }
    })

    test("a chip moved to another pot glides there from where it was (outline-spell P27)", async () => {
      const [from, to] = [new Pot(), new Pot()]
      const chip = new Chip("a")
      core.append(from, new Chip("stays"), chip)
      const { root, done } = await drawPots(from, to)
      core.append(to, chip)
      core.flush()
      await ElementFixture.settle(root)
      // the glide starts before the next paint
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const moved = root.querySelectorAll("game-pot")[1]!.firstElementChild as HTMLElement
      expect(moved.localName).toBe("game-chip")
      expect(moved.getAnimations()).toHaveLength(1)
      done()
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
      core.defineElement(First, "Swap")
      await Promise.resolve()
      const old = await ElementFixture.render<HTMLElement & { thing?: unknown }>("<swap-badge></swap-badge>")
      old.thing = new First()
      flush()
      const oldBadge = old.shadowRoot!.querySelector(".badge")!
      expect(getComputedStyle(oldBadge).color).toBe("rgb(1, 2, 3)")

      // the edited program, run again:  a new class for the same tag
      const Second = badgeVersion("rgb(7, 8, 9)", "second")
      core.defineElement(Second, "Swap")
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
      static elementTag = core.defineElement(this, "Plain")
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
      static elementTag = core.defineElement(this, "Plain")
      static instanceType = Ace2
    }

    test("a plain page writes <plain-stack><plain-ace2 rank=... suit=...>:  each makes its own thing and draws it", async () => {
      await Promise.resolve()
      expect(Stack2.elementTag).toBe("plain-stack2")
      const stack = await ElementFixture.render<HTMLElement>(
        '<plain-stack2><plain-ace2 rank="ace" suit="spades" face-up></plain-ace2></plain-stack2>'
      )
      await ElementFixture.settle(stack)
      core.flush()
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
      core.flush()
      flush()
      expect(card.component!.currentThing!.rank).toBe(2)
      expect(card.shadowRoot!.querySelector(".face")!.textContent).toBe("2 of spades")

      card.turnOver()
      core.flush()
      flush()
      expect(card.shadowRoot!.querySelector(".face")!.textContent).toBe("back")
    })
  })

  describe("the element and its thing agree, both ways (P13)", () => {
    /** A card:  its rank (one of ace, 2, 3, 12), suit, direction (up or down) and whether it's marked. */
    class Deuce extends Drawable {
      static elementTag = core.defineElement(this, "Agree")
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
      core.flush()
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

    test("a property its type always gives the same value can't be set:  the attribute shows the thing's again (outline-spell P27)", async () => {
      /** `- its suit is spades`:  a getter, with no setter. */
      class Spade extends Deuce {
        static elementTag = core.defineElement(this, "Agree")
        get suit() {
          return "spades"
        }
      }
      const spade = await ElementFixture.render<CardElement>('<agree-spade rank="2"></agree-spade>')
      await ElementFixture.settle(spade)
      settle()
      expect(spade.component!.currentThing).toBeInstanceOf(Spade)
      expect(spade.getAttribute("suit")).toBe("spades")
      spade.setAttribute("suit", "hearts")
      settle()
      expect(spade.component!.currentThing!.suit).toBe("spades")
      expect(spade.getAttribute("suit")).toBe("spades")
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
          const children = this.cards.map((card) => () => core.drawThing(card))
          return (h("div", {}, ...children) as unknown as () => ReturnType<Drawable["draw"]>)()
        }
      }
      const felt = new Felt()
      const root = document.createElement("div")
      document.body.append(root)
      core.mountApp(felt, root)
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
      static elementTag = core.defineElement(this, "Drawable Board")
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
    /** A stack of chips, each in one stack at a time:  drawn as its name, every list's, built in. */
    class Stack extends DrawableList<Chip> {
      static elementTag = core.defineElement(this, "Drawable Board")
      static instanceType = Chip
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
      static elementTag = core.defineElement(this, "Drawable Board")
    }
    /** A stack that takes nothing. */
    class Locked extends Stack {
      static elementTag = core.defineElement(this, "Drawable Board")
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
      core.flush()
      flush()
    }

    test("the tag leaves the project's word drawable out:  <board-column>", () => {
      expect(customElements.get("board-column")).toBeDefined()
      expect(customElements.get("drawable-board-column")).toBeUndefined()
    })

    test("a tag's id is its thing's reference:  id=C1 and id=1 find column C1, <board-stack id=C1> too;  one that finds nothing says so", async () => {
      const root = await ElementFixture.render<HTMLElement>(
        "<div>" +
          '<board-column id="C1"></board-column>' +
          '<board-column id="1"></board-column>' +
          '<board-stack id="C1"></board-stack>' +
          '<board-column id="2"></board-column>' +
          '<board-column id="C9"></board-column>' +
          "</div>"
      )
      await ElementFixture.settle(root)
      settle()
      const drawn = () => [...root.children].map((element) => element.shadowRoot?.textContent)
      expect(drawn()).toEqual(["C1", "C1", "C1", "C2", '⚠ no Column named "C9"'])
      const things = [...root.children].map((element) => SpellElement.thingOf(element))
      expect(things.slice(0, 3)).toEqual([c1, c1, c1])

      // the page changes an id:  the tag draws the thing the new id names
      root.lastElementChild!.id = "C2"
      await ElementFixture.settle(root)
      settle()
      expect(drawn()[4]).toBe("C2")
      expect(SpellElement.thingOf(root.lastElementChild!)).toBe(c2)
    })

    test("a thing attribute written in markup names nothing:  the tag makes its own thing, as one with no id does", async () => {
      const column = await ElementFixture.render<HTMLElement>('<board-column thing="Column#C1"></board-column>')
      await ElementFixture.settle(column)
      settle()
      const thing = SpellElement.thingOf(column)
      expect(thing).toBeInstanceOf(Column)
      expect(thing).not.toBe(c1)
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

      core.move(thing, c2)
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

  describe("an element the program draws is named after its thing, by its id (J43)", () => {
    /** A playing card, named for its rank and suit as Drawable Solitaire's is;  drawn as its name. */
    class Playing extends Drawable {
      static elementTag = core.defineElement(this, "Drawable Parlor")
      get rank(): string | undefined {
        return this.getProp("rank") as string | undefined
      }
      set rank(value) {
        this.setProp("rank", value)
      }
      get suit(): string | undefined {
        return this.getProp("suit") as string | undefined
      }
      set suit(value) {
        this.setProp("suit", value)
      }
      get name() {
        return this.rank === undefined ? undefined : `${this.rank}-of-${this.suit}`
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("i", {}, () => `${this.name ?? "blank"}`) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Playing.declareProp("rank", { type: "text" })
    Playing.declareProp("suit", { type: "text" })
    /** A table with two decks' queens of one suit, and a blank card with no name -- see `parlorOf()`. */
    class Parlor extends App {
      cards: Playing[] = []
      draw(): ReturnType<Drawable["draw"]> {
        const children = this.cards.map((card) => () => core.drawThing(card))
        return (h("div", {}, ...children) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }

    /** Let the things' and Solid's changes run. */
    function settle() {
      core.flush()
      flush()
    }

    /**
     * A table with two queens of `suit`, from two decks, and a blank card.
     * - A suit of its own per test:  the program's things outlive a test, and count when ids are numbered.
     */
    function parlorOf(suit: string): Parlor {
      const parlor = new Parlor()
      parlor.cards = [new Playing({ rank: "queen", suit }), new Playing({ rank: "queen", suit }), new Playing()]
      return parlor
    }

    /** `app` drawn in a new root on the page, settled:  the root, and its card elements. */
    async function drawn(app: Drawable) {
      const root = document.createElement("div")
      document.body.append(root)
      core.mountApp(app, root)
      flush()
      await ElementFixture.settle(root)
      settle()
      return { root, cards: [...root.querySelectorAll<HTMLElement>("parlor-playing")] }
    }

    test("each card's id is its thing's name;  a second deck's queen is -2;  a card with no name has no id", async () => {
      const { root, cards } = await drawn(parlorOf("spades"))
      expect(cards.map((card) => card.id)).toEqual(["queen-of-spades", "queen-of-spades-2", ""])
      expect(cards[2]!.hasAttribute("id")).toBe(false)
      root.remove()
    })

    test("its id follows its thing's name;  another element drawing the same thing has the same id", async () => {
      const parlor = parlorOf("clubs")
      const { root, cards } = await drawn(parlor)
      expect(cards[0]!.id).toBe("queen-of-clubs")
      parlor.cards[0]!.rank = "king"
      settle()
      expect(cards[0]!.id).toBe("king-of-clubs")
      // the blank card gets a name:  it gets an id
      parlor.cards[2]!.rank = "ace"
      parlor.cards[2]!.suit = "hearts"
      settle()
      expect(cards[2]!.id).toBe("ace-of-hearts")

      // drawn again elsewhere, as a card moved to another pile is:  the same id, never a new number
      const again = await drawn(parlor.cards[1]!)
      expect(again.root.firstElementChild!.id).toBe(cards[1]!.id)
      root.remove()
      again.root.remove()
    })

    test("the handed thing always wins:  an id never makes it draw another thing;  an id the page writes is kept", async () => {
      const parlor = parlorOf("diamonds")
      const { root, cards } = await drawn(parlor)
      const [first, second] = cards as [HTMLElement, HTMLElement]
      expect(second.id).toBe("queen-of-diamonds-2")
      // a hand-written tag with this id would draw the FIRST deck's queen:  the second's element keeps its own
      second.id = "queen-of-diamonds"
      await ElementFixture.settle(root)
      settle()
      expect(SpellElement.thingOf(second)).toBe(parlor.cards[1])
      expect(second.shadowRoot!.textContent).toBe("queen-of-diamonds")
      // the page's id stays, even when the thing's name changes
      parlor.cards[1]!.rank = "jack"
      settle()
      expect(second.id).toBe("queen-of-diamonds")
      expect(second.shadowRoot!.textContent).toBe("jack-of-diamonds")
      // writing ids never wrote the things:  each element shows its own card's values
      expect([first, second].map((card) => card.getAttribute("rank"))).toEqual(["queen", "jack"])
      root.remove()
    })
  })

  describe("an element class compiled TypeScript hands over:  the page builds the tag on it (P10)", () => {
    /** A tile, labelled, drawn as its label. */
    class Tile extends Drawable {
      static elementTag = core.defineElement(this, "Board")
      static css = ".tile { color: rgb(7, 8, 9) }"
      get label() {
        return this.getProp("label")
      }
      set label(value) {
        this.setProp("label", value)
      }
      get size() {
        return this.getProp("size")
      }
      set size(value) {
        this.setProp("size", value)
      }
      flip() {
        return `flipped ${this.label}`
      }
      poke() {
        return "poked"
      }
      draw(): ReturnType<Drawable["draw"]> {
        return (h("span", { class: "tile" }, () => `${this.label}`) as unknown as () => ReturnType<Drawable["draw"]>)()
      }
    }
    Tile.declareProp("label", { type: "text" })
    Tile.declareProp("size", { type: "number" })

    /** Its element class, as compiled TypeScript writes one:  only what's the tile's own, and a method of its own. */
    class TileElement extends SpellElement<Tile> {
      @E.proto static vocabulary = SpellElement.vocabularyFor("board-tile", "tile", [
        { name: "label", kind: "string", description: "Its label, as written." },
        { name: "glow", kind: "boolean", description: "None of a tile's properties." }
      ])
      @E.protoMerged static elementSetup = {
        styleSheets: { "board-tile": Tile.css }
      } satisfies Partial<E.ElementSetup>

      flip() {
        return `element: ${this.currentThing?.flip()}`
      }
    }
    core.useElement(Tile, TileElement)

    /** A tile with a sheet of its own too, and an element class saying only that. */
    class Gem extends Tile {
      static elementTag = core.defineElement(this, "Board")
      static css = ".tile { background-color: rgb(4, 5, 6) }"
    }
    class GemElement extends SpellElement<Gem> {
      @E.proto static vocabulary = SpellElement.vocabularyFor("board-gem", "gem", [])
      @E.protoMerged static elementSetup = {
        styleSheets: { "board-gem": Gem.css }
      } satisfies Partial<E.ElementSetup>
    }
    core.useElement(Gem, GemElement)

    type TileTag = HTMLElement & {
      label: unknown
      size: unknown
      flip(): string
      poke(): string
      component?: SpellElement<Tile>
    }

    test("its tag is built on the class:  its attributes, then the type's it left out;  its sheet", async () => {
      await Promise.resolve()
      const element = await ElementFixture.render<TileTag>('<board-tile label="A" glow></board-tile>')
      await ElementFixture.settle(element)
      core.flush()
      flush()
      expect(element.component).toBeInstanceOf(TileElement)
      const attributes = element.component!.vocabulary.attributes as readonly E.AttributeSpec[]
      expect(attributes.map((attribute) => attribute.name)).toEqual(["thing", "move-delay", "label", "size", "glow"])
      expect(attributes.find((attribute) => attribute.name === "label")!.description).toBe("Its label, as written.")
      const tile = element.shadowRoot!.querySelector(".tile")!
      expect(tile.textContent).toBe("A")
      expect(getComputedStyle(tile).color).toBe("rgb(7, 8, 9)")

      // the element and its thing agree, as for a bare element:  one the class names, and one it left out
      element.label = "B"
      element.size = 3
      core.flush()
      flush()
      expect(element.component!.currentThing!.label).toBe("B")
      expect(element.component!.currentThing!.size).toBe(3)
    })

    test("a method the class writes is the element's;  the type's others call its thing", async () => {
      const element = await ElementFixture.render<TileTag>('<board-tile label="C"></board-tile>')
      await ElementFixture.settle(element)
      expect(element.flip()).toBe("element: flipped C")
      expect(element.poke()).toBe("poked")
    })

    test("its own sheet comes after its super-types', as for javascript", async () => {
      const element = await ElementFixture.render<TileTag>('<board-gem label="D"></board-gem>')
      await ElementFixture.settle(element)
      flush()
      const tile = element.shadowRoot!.querySelector(".tile")!
      expect(getComputedStyle(tile).color).toBe("rgb(7, 8, 9)")
      expect(getComputedStyle(tile).backgroundColor).toBe("rgb(4, 5, 6)")
    })

    test("the page defines the tag once:  defining it again keeps it", () => {
      const defined = customElements.get("board-tile")
      SpellElement.defineFor("board-tile", Tile, core)
      expect(customElements.get("board-tile")).toBe(defined)
    })

    test("the TypeScript writer knows every member an element has:  a type's method of that name is left out", async () => {
      const element = await ElementFixture.render<TileTag>("<board-tile></board-tile>")
      await ElementFixture.settle(element)
      const names = new Set(Object.getOwnPropertyNames(element.component))
      for (
        let at: object | null = SpellElement.prototype;
        at && at !== Object.prototype;
        at = Object.getPrototypeOf(at)
      ) {
        for (const name of Object.getOwnPropertyNames(at)) names.add(name)
      }
      names.delete("constructor")
      expect([...names].filter((name) => !P.TSWriter.ELEMENT_MEMBERS.has(name)).sort()).toEqual([])
    })
  })
})
