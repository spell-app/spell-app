import { expect, it } from "vitest"
import { commands } from "vitest/browser"
import { flush } from "solid-js"

import { ElementFixture } from "$test/ElementFixture"
import { PerfRun } from "$test/PerfRun"

import "$/components/dropdown"

/** Solid's `PerfAdapter`:  writes land on a microtask;  `flush()` applies them now. */
const SOLID_SETTLE = { settle: () => flush() }

/**
 * The dropdown benchmark (`test/PerfRun.ts`):  1000 options, `"united sta"` typed one character per keystroke;
 * each keystroke must stay under a frame (16 ms), event => DOM updated.
 * - SIDE EFFECT:  writes `tools/results/perf-results.json` (browser-mode `console.log` doesn't reach the
 *   terminal), for `yarn report`.
 */
it("filters 1000 options in under a frame per keystroke (PerfRun)", async () => {
  const host = await ElementFixture.render(`<ui-dropdown search selection placeholder="Search"></ui-dropdown>`)
  const result = await PerfRun.run(host as Parameters<typeof PerfRun.run>[0], SOLID_SETTLE)
  await PerfRun.save(
    { package: "@spell/ui", where: "vitest browser mode", build: "dev (Vite dev server)", result },
    commands.writeFile,
    "tools/results/perf-results.json"
  )
  expect(result.open.rows).toBe(PerfRun.count)
  expect(result.keystrokes.at(-1)!.rows).toBeLessThan(PerfRun.count)
  expect(result.update.avg).toBeLessThan(16)
})
