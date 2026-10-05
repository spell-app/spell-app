import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { test, expect } from "vite-plus/test"

import { spellCore, Thing, List, App } from "$/core"

/**
 * SCRATCH:  headless Solitaire play-through on the live example's compiled JS (P10).
 * - Runs `Solitaire.compiled.js` as written by the worktree's CLI, on `core`'s source.
 * - Every `spellCore.move()` is checked against Klondike's rules, independently of the guards.
 */
const COMPILED = resolve(__dirname, "../projects/system/examples/Solitaire/Solitaire.compiled.js")
const RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]

type Card = { rank: unknown; suit: string; is_face_up: boolean; pile: unknown; play(): Promise<unknown> }
type Pile = List & { name: string }

test("Solitaire, headless:  deal, stock plays, auto-play, cheats, clicks, a second deal", async () => {
  const code = readFileSync(COMPILED, "utf8")
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .filter((line) => line !== "reset_the_game()" && line !== "game.start()")
    .join("\n")
    .replace(/^export /gm, "")
  const names = "game, stock, discards, foundations, tableaus, all_piles, deck"
  const fns = "deal_the_cards, play_from_the_stock_pile, auto_play, cheat, reset_the_game"
  const realPause = spellCore.pauseFor
  const realLog = spellCore.console.log
  const realStyles = spellCore.installStyles
  spellCore.pauseFor = () => new Promise((done) => setTimeout(done, 0))
  spellCore.installStyles = () => {}
  spellCore.console.log = () => {}
  const moves: Array<{ ok: boolean; why?: string }> = []
  const realMove = spellCore.move
  let illegal = 0
  let refused = 0
  let moved = 0
  try {
    spellCore.resetRuntime()
    // oxlint-disable-next-line no-implied-eval -- running compiled spell, as a runner does
    const fn = new Function("spellCore", "Thing", "List", "App", `${code}\nreturn { ${names}, ${fns} }`)
    const run = fn(spellCore, Thing, List, App) as Record<string, any>
    const { stock, discards, foundations, tableaus, all_piles, deck } = run
    const piles = (all_piles as List).getValues() as Pile[]

    // every move, checked by Klondike's rules -- before it happens
    spellCore.move = (card: unknown, to: unknown) => {
      const c = card as Card
      const from = c.pile as Pile | undefined
      const why = illegalBecause(c, from, to as Pile)
      const ok = realMove(card, to)
      if (ok) moved++
      else refused++
      if (ok && why) {
        illegal++
        moves.push({ ok, why })
      }
      return ok
    }

    await run.deal_the_cards()
    check("first deal")
    expect(((tableaus as List).getValues() as Pile[]).map((pile) => pile.length)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect((stock as List).length + (discards as List).length).toBe(24)

    // more stock plays than the stock holds:  turns the discards over, twice
    for (let i = 0; i < 60; i++) {
      await run.play_from_the_stock_pile()
      check(`stock play ${i}`)
    }
    await run.auto_play()
    check("auto-play")

    // click each face-up card a few times over
    for (let round = 0; round < 3; round++) {
      for (const pile of piles) {
        for (const card of pile.getValues() as Card[]) {
          if (card.is_face_up && card.pile === pile) await card.play()
          check(`click ${round}`)
        }
      }
      await run.play_from_the_stock_pile()
      await run.auto_play()
      check(`round ${round}`)
    }

    // refused:  a foundation never lets go;  an illegal take changes nothing
    const foundation = ((foundations as List).getValues() as Pile[]).find((it) => it.length)
    if (foundation) {
      const top = spellCore.getItemOf(foundation, -1) as Card
      expect(realMove(top, piles.find((it) => it !== foundation && it.name !== "stock")!)).toBe(false)
      expect(top.pile).toBe(foundation)
    }
    const king = (deck as List).getValues().find((card) => (card as Card).rank === "king" && (card as Card).is_face_up)
    const emptyFoundation = ((foundations as List).getValues() as Pile[]).find((it) => !it.length)
    if (king && emptyFoundation) {
      const before = (king as Card).pile
      expect(realMove(king, emptyFoundation)).toBe(false)
      expect((king as Card).pile).toBe(before)
    }

    for (let i = 0; i < 5; i++) {
      await run.cheat()
      check(`cheat ${i}`)
    }
    await run.auto_play()
    check("auto-play after cheats")

    // a second deal gathers every card back -- foundations included -- with `add`, never refused
    await run.deal_the_cards()
    check("second deal")
    expect(((foundations as List).getValues() as Pile[]).every((pile) => pile.length === 0)).toBe(true)
    expect(((tableaus as List).getValues() as Pile[]).map((pile) => pile.length)).toEqual([1, 2, 3, 4, 5, 6, 7])

    // ten more deals, each:  stock plays, clicks, auto-play -- and random moves the guards must judge
    const targets = [...(foundations as List).getValues(), ...(tableaus as List).getValues()] as Pile[]
    let fuzzRefused = 0
    let fuzzMoved = 0
    for (let game = 0; game < 10; game++) {
      await run.deal_the_cards()
      check(`deal ${game}`)
      for (let turn = 0; turn < 40; turn++) {
        if ((stock as List).length + (discards as List).length) await run.play_from_the_stock_pile()
        for (const pile of piles) {
          const top = spellCore.getItemOf(pile, -1) as Card | undefined
          if (top?.is_face_up) await top.play()
        }
        // a random card -- the last of its pile, or any -- to a random foundation or tableau
        const all = (deck as List).getValues() as Card[]
        for (let i = 0; i < 5; i++) {
          let card = all[Math.floor(Math.random() * all.length)]!
          // a face-up card mid-tableau moves with what's on it, never alone:  `to play a card`
          const midRun = card.is_face_up && (card.pile as Pile).constructor.name === "Tableau"
          if (midRun || Math.random() < 0.7) {
            const last = spellCore.getItemOf(card.pile, -1) as Card | undefined
            if (last) card = last
          }
          const target = targets[Math.floor(Math.random() * targets.length)]!
          const where = card.pile
          const before = (where as List).getValues()
          if (spellCore.move(card, target)) {
            fuzzMoved++
            // as `to play a card` does:  turn over what it uncovered
            const uncovered = spellCore.getItemOf(where, -1) as (Card & { turn_face_up(): void }) | undefined
            if ((where as Pile).constructor.name === "Tableau" && uncovered) uncovered.turn_face_up()
          }
          else {
            fuzzRefused++
            expect(card.pile).toBe(where)
            expect((where as List).getValues()).toEqual(before)
          }
        }
        check(`game ${game} turn ${turn}`)
      }
      await run.auto_play()
      check(`game ${game} auto-play`)
    }
    process.stdout.write(`PLAYTHROUGH fuzz:  ${fuzzMoved} random moves allowed, ${fuzzRefused} refused\n`)

    process.stdout.write(`PLAYTHROUGH moves:  ${moved} made, ${refused} refused, ${illegal} illegal\n`)
    expect(moves).toEqual([])
    expect(moved).toBeGreaterThan(20)

    /** Invariants:  52 cards, each in exactly one pile, its `pile` that pile. */
    function check(when: string) {
      const cards = (deck as List).getValues() as Card[]
      expect(cards.length, when).toBe(52)
      for (const card of cards) {
        const holders = piles.filter((pile) => pile.getValues().includes(card))
        expect(holders.length, `${when}:  ${String(card.rank)} of ${card.suit}`).toBe(1)
        expect(card.pile, when).toBe(holders[0])
      }
      const total = piles.reduce((sum, pile) => sum + pile.length, 0)
      expect(total, when).toBe(52)
    }

    /** Why moving `card` from `from` to `to` breaks Klondike's rules -- `undefined` if it doesn't. */
    function illegalBecause(card: Card, from: Pile | undefined, to: Pile): string | undefined {
      const kind = (pile: Pile | undefined) => pile?.constructor.name
      const last = (pile: Pile) => spellCore.getItemOf(pile, -1) as Card | undefined
      if (kind(from) === "Foundation") return "out of a foundation"
      if ((kind(from) === "Stock_Pile" || kind(from) === "Discard_Pile") && last(from!) !== card) return "not the top"
      if (kind(from) === "Tableau" && !card.is_face_up) return "face down"
      const rank = RANKS.indexOf(card.rank)
      if (kind(to) === "Foundation") {
        if (from && last(from) !== card) return "a stack onto a foundation"
        const top = last(to)
        if (to.name !== card.suit) return "wrong suit"
        if (!top ? rank !== 0 : RANKS.indexOf(top.rank) + 1 !== rank) return "wrong rank on foundation"
      }
      if (kind(to) === "Tableau") {
        const top = last(to)
        if (!top) return rank === 12 ? undefined : "not a king on an empty tableau"
        const red = (it: Card) => it.suit === "hearts" || it.suit === "diamonds"
        if (red(top) === red(card) || RANKS.indexOf(top.rank) !== rank + 1) return "wrong card on tableau"
      }
      return undefined
    }
  } finally {
    spellCore.move = realMove
    spellCore.pauseFor = realPause
    spellCore.installStyles = realStyles
    spellCore.console.log = realLog
  }
})
