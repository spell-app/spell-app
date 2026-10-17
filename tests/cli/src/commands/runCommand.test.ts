import { describe, test, expect } from "vite-plus/test"

import { solidSample } from "$/spell/test"
import { CLI } from "$/cli"

/**
 * `runCode()` on Solid TypeScript (the `ts/solid` target's `.tsx`):  built first (`buildTsx()`), then run as any
 * compiled spell, in a fake page.
 * - On `Cards.sample.tsx` (`solidSample()`), the hand-written Solid TypeScript the target writes:
 *   `@prop`, `@drawn`, `<Show>`, `<For>`, a `<ui-button>`.
 */

/**
 * Clicks after the sample has drawn:  on its face-down card (`<Show>` flips it), and on its score button.
 * - Once the module has loaded:  Solid's compiler listens for clicks (`delegateEvents()`) at its END.
 */
const CLICKS = `
setTimeout(() => {
  document.querySelector(".face-down")!.dispatchEvent(new Event("click", { bubbles: true }))
  document.querySelector(".score")!.dispatchEvent(new Event("click", { bubbles: true }))
  spellCore.flush()
  spellCore.console.log("score:", game.score, "cards:", game.stock.items.map((card) => card.direction).join(", "))
})
`

describe("runCode()", () => {
  test("builds a .tsx and runs it:  it draws, a click handler runs, and <Show> follows the card it flipped", async () => {
    const code = solidSample() + CLICKS
    const { exitCode, output } = await CLI.runCode("run", "Cards", code, {
      extension: ".tsx",
      capture: true,
      dom: true
    })
    expect(exitCode, output).toBe(CLI.EXIT.OK)
    expect(output).toMatchInlineSnapshot(`
      "score: 1 cards: up, up

      <div id="spell-app-root"><div class="Game"><ui-button class="score">Score 1</ui-button><div class="Pile" title="stock"><div class="Card face-up ace spades">A <span class="suit">spades</span></div><div class="Card face-up 2 clubs">2 <span class="suit">clubs</span></div></div><p class="top"><div class="Card face-up 2 clubs">2 <span class="suit">clubs</span></div></p></div></div>
      "
    `)
  }, 30_000)
})
