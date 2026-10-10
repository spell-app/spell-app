/**
 * Solid TypeScript as the `ts/solid` target writes it (epic `output-targets` P12), written by hand:  a sample of
 * Solitaire's `Card`, a pile and a game, trimmed to run alone.
 * - Checks the plumbing around the writer, apart from the writer:  `typecheck()` (`typescript.test.ts`),
 *   building it (`buildTsx.test.ts`) and running it (`cli`'s `runCommand.test.ts`).
 * - Read with `solidSample()` (`$/spell/test`).  NOT part of spell's own `tsc`:  it imports `@spell/core`, as compiled
 *   spell does, which only those resolve (`tsconfig.json`'s `exclude`).
 */
import { Show, For } from "solid-js"
import { spellCore, List, App, Thing, prop, thing, drawn } from "@spell/core"

/** card ranks */
const RANKS = ["ace", 2, 3, "king"] as const
/** card direction:  up or down */
const DIRECTIONS = ["up", "down"] as const

/** A card's rank. */
export type Rank = (typeof RANKS)[number]
/** Which way a card faces. */
export type Direction = (typeof DIRECTIONS)[number]

/** A playing card. */
export class Card extends Thing {
  static Ranks = RANKS
  @prop({ oneOf: RANKS }) accessor rank!: Rank
  // lazy:  `Suits` is defined below
  @prop({ oneOf: () => Card.Suits }) accessor suit!: (typeof Card.Suits)[number]
  static Suits = ["clubs", "spades"] as const
  static Directions = DIRECTIONS
  @prop({ oneOf: DIRECTIONS }) accessor direction!: Direction

  /** value as a derivation of rank */
  get value() {
    return spellCore.itemOf(Card.Ranks, this.rank)
  }

  get isFaceDown() {
    return this.direction == "down"
  }

  get shortRank() {
    if (spellCore.isOfType(this.rank, "number")) return `${this.rank}`
    return spellCore.upperCase(spellCore.getItemOf(this.rank, 1))
  }

  /** Flip card to opposite direction */
  async turnOver() {
    this.direction = this.direction == "up" ? "down" : "up"
    await spellCore.pauseFor(50, "msec")
  }

  @drawn
  draw() {
    const className = () => `Card face-${this.direction} ${this.rank} ${this.suit}`
    const click = () => this.turnOver()
    return (
      <Show
        when={!this.isFaceDown}
        fallback={
          <div onClick={click} class={className()}>
            <i class="fitted bicycle icon" />
          </div>
        }
      >
        <div onClick={click} class={className()}>
          {this.shortRank + " "}
          <span class="suit">{this.suit}</span>
        </div>
      </Show>
    )
  }
}

/** A pile of cards. */
export class Pile extends List<Card> {
  @prop({ type: "text", default: "pile" }) accessor name!: string

  @drawn
  draw() {
    return (
      <div class="Pile" title={this.name}>
        <For each={this.items}>{(card) => card.draw()}</For>
      </div>
    )
  }
}

/** The game:  its stock pile, and a score. */
@thing
export class Game extends App {
  @prop({ init: () => new Pile({ name: "stock" }) }) accessor stock!: Pile
  @prop({ type: "number", default: 0 }) accessor score!: number

  create() {
    super.create()
    this.stock.add(
      new Card({ rank: "ace", suit: "spades", direction: "down" }),
      new Card({ rank: 2, suit: "clubs", direction: "up" })
    )
  }

  @drawn
  draw() {
    return (
      <div class="Game">
        <ui-button class="score" prop:value={this.score} onClick={() => this.score++}>
          Score {this.score}
        </ui-button>
        {this.stock.draw()}
        <p class="top">{spellCore.getItemOf(this.stock, -1)?.draw()}</p>
      </div>
    )
  }
}

export const game = new Game()
game.start()
