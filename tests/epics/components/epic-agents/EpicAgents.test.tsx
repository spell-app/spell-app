import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-agents"

// the panel with agents in it, on a page:  `EpicPage.test.tsx`, "<epic-page> Agents running"

describe("<epic-agents>", () => {
  test("no page served with a token, no list:  its box is there, empty;  passes axe", async () => {
    const host = await ElementFixture.render(`<epic-agents></epic-agents>`)
    const box = host.shadowRoot!.querySelector("[part~='base']")!
    expect([box.className, box.childElementCount]).toEqual(["agents-box", 0])
    await expectAccessible(host)
  })
})
