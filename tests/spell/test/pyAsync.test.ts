import { writeFileSync } from "fs"
import { describe, test, expect } from "vite-plus/test"

import { PY } from "spell-parser/py"
import { compiledFixture } from "spell-app/spaces/test"

/**
 * The `py` target's writer, `PY.PyWriter`, on asyncio (epic `python-target` P11, one target since P22):  a function that waits is
 * `async def`, and everything that calls it awaits it -- javascript calls them without waiting.
 * - Its whole output is pinned by the fixtures' `.snapshot.py`, and run by the core contract.
 */
describe("Python on asyncio", () => {
  // Solitaire, its cards its own
  const cards = compiledFixture("Solitaire", PY.PyWriter.instance)
  if (process.env.SPELL_DUMP_ASYNC) writeFileSync(process.env.SPELL_DUMP_ASYNC, cards)

  test("a method that pauses waits:  `async def`, `await core.pause_for(...)`", () => {
    expect(cards).toContain("    async def play_from_the_stock(self) -> None:")
    expect(cards).toContain('            await core.pause_for(50, "msec")')
  })

  test("a method that calls one that waits waits too, and awaits it", () => {
    expect(cards).toContain("    async def start_a_new_game(self) -> None:")
    expect(cards).toContain("        await self.deal_the_cards()")
  })

  test("a getter that doesn't wait stays a plain property", () => {
    expect(cards).toMatch(/@property\n {4}def name\(self\) -> str:/)
  })

  // (a `create()` that waits was the deck's, which turned each card face down with a pause:  a two sided card
  // starts face down since the showcase, epic `elemental-spell`, so no fixture has one now)
  test("a handler that calls one that waits is `async def` too", () => {
    expect(cards).toMatch(/\n {4}async def when_card_dropped_on\(self, card: Card\) -> None:\n {8}await card\.put_on_pile\(self\)\n/)
  })

  test("the top level runs what waits with asyncio.run()", () => {
    expect(cards).toMatch(/^from __future__ import annotations\n\nimport asyncio\n/)
    expect(cards).toContain("asyncio.run(solitaire.start_a_new_game())")
  })
})
