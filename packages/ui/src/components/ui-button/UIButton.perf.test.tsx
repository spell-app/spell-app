import { expect, it } from "vite-plus/test"
import { commands } from "vite-plus/test/browser"
import { flush } from "solid-js"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-button"

/** Buttons per run. */
const COUNT = 1000

/** Timed runs, after one warm-up. */
const RUNS = 9

/**
 * The element-core benchmark (epic `spell-element`, Q13):  1,000 `<ui-button>`s put in the page at once, timed until
 * every one is ready and Solid has flushed.
 * - It times the custom-element layer (upgrade, attributes, component, first render) more than the button itself,
 *   so the "before" and "after" numbers of the solid-element fold compare like for like.
 * - One warm-up run (styles registered, chunks loaded), then `RUNS` timed ones;  the median is the number to quote.
 * - SIDE EFFECT:  writes `tools/results/build-perf.json` (browser-mode `console.log` doesn't reach the terminal).
 */
it("builds 1,000 <ui-button>s", async () => {
  const markup = Array.from({ length: COUNT }, (_, index) => `<ui-button primary>Button ${index}</ui-button>`).join("")
  await build(markup)
  const times: number[] = []
  for (let run = 0; run < RUNS; run++) times.push(await build(markup))
  const sorted = [...times].sort((a, b) => a - b)
  const median = sorted[Math.floor(RUNS / 2)]!
  await commands.writeFile(
    "tools/results/build-perf.json",
    `${JSON.stringify({ count: COUNT, runs: times, median, date: new Date().toISOString().slice(0, 10) }, null, 2)}\n`
  )
  expect(median).toBeGreaterThan(0)
})

/** Put `markup` in a fresh container, wait for every element in it;  ms taken.  The container is removed after. */
async function build(markup: string): Promise<number> {
  const container = document.createElement("div")
  document.body.append(container)
  const start = performance.now()
  container.innerHTML = markup
  await ElementFixture.settle(container)
  const time = performance.now() - start
  container.remove()
  flush()
  return time
}
