import { writeFileSync } from "fs"
import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { compiledFixture } from "$/spell/test"

/**
 * The `py/asyncio` target's writer, `P.PyAsyncWriter` (epic `python-target` P11):  a function that waits is
 * `async def`, and everything that calls it awaits it -- javascript calls them without waiting.
 * - Its whole output is pinned by the fixtures' `.snapshot.asyncio.py`, and run by the core contract.
 */
describe("Python on asyncio", () => {
  const cards = compiledFixture("Cards", P.PyAsyncWriter.instance)
  if (process.env.SPELL_DUMP_ASYNC) writeFileSync(process.env.SPELL_DUMP_ASYNC, cards)

  test("a method that pauses waits:  `async def`, `await core.sleep(...)`", () => {
    expect(cards).toContain("    async def turn_face_up(self) -> None:")
    expect(cards).toContain('        await core.sleep(50, "msec")')
  })

  test("a method that calls one that waits waits too, and awaits it", () => {
    expect(cards).toContain("    async def turn_over(self) -> None:")
    expect(cards).toContain("            await self.turn_face_down()")
  })

  test("a getter that doesn't wait stays a plain property", () => {
    expect(cards).toMatch(/@property\n {4}def color\(self\) -> str:/)
  })

  test("the top level runs what waits with asyncio.run()", () => {
    expect(cards).toMatch(/^from __future__ import annotations\n\nimport asyncio\n/)
    expect(cards).toContain("asyncio.run(test_card_setup())")
  })
})
