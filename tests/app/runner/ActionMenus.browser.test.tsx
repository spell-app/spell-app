import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import h from "@solidjs/h"

import { core, App, View } from "spell-parser/core"
import { installSpellElements } from "spell-app/app/runner/SpellElement"
import { ActionMenus } from "spell-app/app/runner/ActionMenus"

import "spell-app/app/solid/cellsBridge"
import "spell-ui/components/ui-action"
import "spell-ui/components/ui-toolbar"

/**
 * A program's actions on the page (epic `elemental-spell` P10):  a small Solitaire, its game menu as the app's menu
 * bar, a toolbar and a card's right click, its shortcuts run only while enabled, and undo naming what it undoes.
 * - The classes are what spell compiles a template like this to:
 *
 *       solitaire is an app where:
 *         - to deal:
 *           - shortcut meta+D
 *           - enabled when its card is face up
 *           - undone as "Deal"
 *         - its "game menu" is a menu of "deal", "-", "undo" and "redo"
 *         - its menu bar is "game menu"
 *         - to draw it:  the card, then `<ui-toolbar menu="game menu" />`
 *       a card is a view where:
 *         - to turn it over:  (undone as "Turn Card")
 *         - to draw it:  `<span context-menu="game menu">`
 */
describe("ActionMenus:  a Solitaire's game menu", () => {
  installSpellElements(core)

  /** A card, face up or down;  right-clicked, its game's menu. */
  class Card extends View {
    static elementTag = core.defineElement(this, "Patience")
    static {
      this.declareProp("faceUp", { type: "choice" })
    }
    get faceUp(): boolean {
      return this.getProp("faceUp")
    }
    set faceUp(faceUp: boolean) {
      this.setProp("faceUp", faceUp)
    }
    turnOver(): void {
      this.faceUp = !this.faceUp
    }
    draw(): ReturnType<View["draw"]> {
      const face = () => (this.faceUp ? "up" : "down")
      return (
        h("span", { class: "card", "context-menu": "game menu" }, face) as unknown as () => ReturnType<View["draw"]>
      )()
    }
  }
  core.describeAction(Card, "turnOver", { title: "turn it over", undoneAs: "Turn Card" })

  /** The game:  one card, a deal that turns it face down, its menu bar and a toolbar of the same menu. */
  class Patience extends App {
    static elementTag = core.defineElement(this, "Patience", "App")
    static menuBar = "game menu"
    card = new Card({ faceUp: true })
    deal(): void {
      this.card.faceUp = false
    }
    get dealIsEnabled(): boolean {
      return this.card.faceUp
    }
    draw(): ReturnType<View["draw"]> {
      return (
        h(
          "div",
          { class: "table" },
          () => core.drawThing(this.card),
          h("ui-toolbar", { menu: "game menu", "aria-label": "Game" })
        ) as unknown as () => ReturnType<View["draw"]>
      )()
    }
  }
  core.describeAction(Patience, "deal", {
    title: "deal",
    shortcuts: ["meta+D"],
    enabledWhen: "dealIsEnabled",
    undoneAs: "Deal"
  })
  core.describeMenu(Patience, "gameMenu", { items: ["deal", "-", "undo", "redo"] })

  let root: HTMLElement

  beforeEach(() => {
    core.resetRuntime()
    root = document.createElement("div")
    document.body.append(root)
  })

  afterEach(() => {
    ActionMenus.closeContextMenu()
    root.remove()
  })

  /** The game, mounted, with its app's element and its card's, drawn. */
  async function mountedGame() {
    await Promise.resolve()
    const game = new Patience()
    core.mountApp(game, root)
    flush()
    const app = root.querySelector("patience-app") as HTMLElement & { ready: Promise<void> }
    await app.ready
    flush()
    const card = app.querySelector("patience-card") as HTMLElement & { ready: Promise<void> }
    await card.ready
    flush()
    return { game, app, card }
  }

  /** The titles `element`'s actions draw, `-` for a divider. */
  async function titlesIn(element: Element): Promise<string[]> {
    const actions = [...element.querySelectorAll("ui-action, ui-item")] as Array<HTMLElement & { ready: Promise<void> }>
    await Promise.all(actions.map((action) => action.ready))
    flush()
    return actions.map((action) =>
      action.localName === "ui-item" ? "-" : action.shadowRoot!.querySelector("[part~=title]")!.textContent!.trim()
    )
  }

  /** `action`'s item box, which a click presses. */
  function boxOf(action: Element): HTMLElement {
    return action.shadowRoot!.querySelector<HTMLElement>("[part~=item]")!
  }

  /** Press `key` with the platform's command key (command on a Mac, control elsewhere), as a person would. */
  function pressCommand(key: string) {
    const isMac = /mac/i.test(navigator.platform || navigator.userAgent)
    const event = new KeyboardEvent("keydown", {
      key,
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(event)
    return event
  }

  test("the app's menu bar and its toolbar draw the game menu:  each action's title, live", async () => {
    const { game, app } = await mountedGame()
    const menuBar = app.shadowRoot!.querySelector("[part~=menu-bar]")!
    expect(menuBar.localName).toBe("ui-toolbar")
    expect(await titlesIn(menuBar)).toEqual(["deal", "-", "Undo", "Redo"])
    const toolbar = app.querySelector("ui-toolbar[menu]")!
    // filled once it has drawn
    await expect.poll(() => toolbar.querySelectorAll("ui-action").length).toBe(3)
    expect(await titlesIn(toolbar)).toEqual(["deal", "-", "Undo", "Redo"])
    // undo names what it undoes (C11), and its item follows
    boxOf(toolbar.querySelector("ui-action")!).click()
    expect(game.card.faceUp).toBe(false)
    flush()
    expect(await titlesIn(menuBar)).toEqual(["deal", "-", "Undo Deal", "Redo"])
  })

  test("a right click on the card shows its game's menu where it was clicked;  choosing an action runs it", async () => {
    const { game, card } = await mountedGame()
    const face = card.shadowRoot!.querySelector(".card")!
    face.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, composed: true, cancelable: true, clientX: 40, clientY: 50 })
    )
    const menu = document.querySelector("ui-menu[data-spell-action-menu]") as HTMLElement
    expect(menu).not.toBeNull()
    expect(menu.style.left).toBe("40px")
    expect(await titlesIn(menu)).toEqual(["deal", "-", "Undo", "Redo"])
    boxOf(menu.querySelector("ui-action")!).click()
    expect(game.card.faceUp).toBe(false)
    expect(menu.isConnected).toBe(false)
    // the card's turn, undone by name
    core.runAction(game.card, "turnOver", "click")
    expect(game.undoTitle).toBe("Undo Turn Card")
  })

  test("a shortcut runs its action only while it's enabled;  the app's own undo takes ⌘Z", async () => {
    const { game, card } = await mountedGame()
    // the page starts hearing keys from the first mouse event (`SpellElement.noteInput()`)
    card.dispatchEvent(new MouseEvent("mouseenter"))
    game.card.faceUp = false
    expect(pressCommand("d").defaultPrevented).toBe(false)
    game.card.faceUp = true
    expect(pressCommand("d").defaultPrevented).toBe(true)
    expect(game.card.faceUp).toBe(false)
    expect(game.undoTitle).toBe("Undo Deal")
    expect(pressCommand("z").defaultPrevented).toBe(true)
    expect(game.card.faceUp).toBe(true)
  })
})
