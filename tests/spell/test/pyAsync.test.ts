import { writeFileSync } from "fs"
import { describe, test, expect } from "vite-plus/test"

import { PY } from "spell-lang/py"
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
    expect(cards).toContain("    async def turn_face_up(self) -> None:")
    expect(cards).toContain('        await core.pause_for(50, "msec")')
  })

  test("a method that calls one that waits waits too, and awaits it", () => {
    expect(cards).toContain("    async def turn_over(self) -> None:")
    expect(cards).toContain("            await self.turn_face_down()")
  })

  test("a getter that doesn't wait stays a plain property", () => {
    expect(cards).toMatch(/@property\n {4}def name\(self\) -> str:/)
  })

  test("a `create()` that waits is `async def` too:  `spell_core` runs it to its end as the thing is made", () => {
    // the deck's `to create it:` turns each card face down, which pauses
    expect(cards).toMatch(
      /\n {4}async def create\(self\) -> None:\n(?: {8}.*\n)*? {12}await card\.turn_face_down\(\)\n/
    )
  })

  test("the top level runs what waits with asyncio.run()", () => {
    expect(cards).toMatch(/^from __future__ import annotations\n\nimport asyncio\n/)
    expect(cards).toContain("asyncio.run(test_card_setup())")
  })
})
