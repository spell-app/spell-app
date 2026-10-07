import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-commit"

/** Commits under a box that shows them (`--epic-commits-display`), as the page's git toggle does. */
function shown(inner: string, repo = ""): string {
  return `<epic-page epic="demo" title="Demo"${repo}><div style="--epic-commits-display: block">${inner}</div></epic-page>`
}

describe("<epic-commit>", () => {
  test("its short sha links to the commit through the page's `repo`;  the first of a run carries `Commits:`", async () => {
    const root = await ElementFixture.render(
      shown(
        `<epic-commit sha="0123456789abcdef">First</epic-commit><epic-commit sha="fedcba9876543210">Second</epic-commit>`,
        ` repo="https://github.com/spell-app/spell-app/"`
      )
    )
    const [first, second] = root.querySelectorAll("epic-commit")
    const link = first!.shadowRoot!.querySelector<HTMLAnchorElement>('[part~="sha"]')!
    expect({ text: link.textContent, href: link.getAttribute("href"), target: link.target }).toEqual({
      text: "0123456",
      href: "https://github.com/spell-app/spell-app/commit/0123456789abcdef",
      target: "github"
    })
    const heading = (commit: Element) =>
      getComputedStyle(commit.shadowRoot!.querySelector('[part~="heading"]')!).display
    expect([heading(first!), heading(second!)]).toEqual(["grid", "none"])
    expect(first!.shadowRoot!.querySelector('[part~="heading"]')!.textContent).toBe("Commits:")
    await expectAccessible(first!)
  })

  test("without a `repo`:  the sha as code, no link;  hidden until something shows the commits", async () => {
    const commit = await ElementFixture.render(`<epic-commit sha="0123456789abcdef">Only</epic-commit>`)
    expect(commit.shadowRoot!.querySelector('[part~="sha"]')!.localName).toBe("code")
    expect(getComputedStyle(commit).display).toBe("none")
  })
})
