import { render } from "ink-testing-library"
import { describe, test, expect, vi } from "vite-plus/test"

import { CLI } from "$/cli"

const KEY = { down: "\u001B[B", tab: "\t", enter: "\r", escape: "\u001B" }

/** Let Ink -- and the choices, worked out async -- catch up with the input just written. */
const settle = () => new Promise((done) => setTimeout(done, 60))

/**
 * Draw a `<ProjectPrompt>` with `recents`, type each of `keys`, and return the last frame and what it picked.
 * - `untilPicked`:  then wait (5s at most) for the pick, rather than one `settle()`:  keys typed together wait on each
 *   other's choices, read from disk, which take longer on a busy machine.
 */
async function prompt(keys: string[], recents: string[] = [], { untilPicked = false } = {}) {
  const onDone = vi.fn()
  const { stdin, lastFrame, unmount } = render(
    <CLI.ProjectPrompt choicesFor={(text) => CLI.projectChoices(text, recents)} onDone={onDone} />
  )
  await settle()
  for (const key of keys) {
    stdin.write(key)
    await settle()
  }
  if (untilPicked) await vi.waitFor(() => expect(onDone).toHaveBeenCalled(), { timeout: 5_000 })
  const frame = lastFrame() ?? ""
  unmount()
  return { frame, onDone }
}

describe("<ProjectPrompt>", () => {
  test("starts with recent picks, then the groups", async () => {
    const { frame } = await prompt([], ["@spell/test/fizzbuzz"])
    expect(frame).toMatch(/^Which project or file\? {2}█\n❯ @spell\/test\/fizzbuzz {2}\(recent\)\n {2}owen@spell\//)
  })

  test("Tab completes as far as the choices agree", async () => {
    const { frame } = await prompt(["@spell/te", KEY.tab])
    const projects = [
      "card-table",
      "cards",
      "cards-from-zero",
      "drawable-solitaire",
      "fizzbuzz",
      "klondike",
      "outline-solitaire",
      "people",
      "solitaire",
      "thing-references"
    ]
    const lines = projects.map((name, at) => `${at ? "  " : "❯ "}@spell/test/${name}//`)
    expect(frame).toContain(["Which project or file?  @spell/test/█", ...lines, "  ...11 in all"].join("\n"))
  })

  test("Enter goes into a group, then a project -- entire project first -- and picks", async () => {
    const { frame, onDone } = await prompt([
      "@spell/test/",
      KEY.down,
      KEY.down,
      KEY.down,
      KEY.down,
      KEY.down,
      KEY.down,
      KEY.down,
      KEY.down,
      KEY.enter
    ])
    expect(frame).toContain(
      "@spell/test/solitaire//█\n❯ @spell/test/solitaire  entire project\n  @spell/test/solitaire//Card.spell"
    )
    expect(onDone).not.toHaveBeenCalled()

    const picked = await prompt(["@spell/test/solitaire//", KEY.down, KEY.enter])
    expect(picked.onDone).toHaveBeenCalledWith("@spell/test/solitaire//Card.spell")
    const whole = await prompt(["@spell/test/solitaire//", KEY.enter])
    expect(whole.onDone).toHaveBeenCalledWith("@spell/test/solitaire")
  })

  test("Enter on a recent pick picks it", async () => {
    const { onDone } = await prompt([KEY.enter], ["@spell/test/fizzbuzz"])
    expect(onDone).toHaveBeenCalledWith("@spell/test/fizzbuzz")
  })

  test("keys arriving together, e.g. typed while choices load, still complete in order", async () => {
    const { onDone } = await prompt(["@spell/te\tsol\t\r"], [], { untilPicked: true })
    expect(onDone).toHaveBeenCalledWith("@spell/test/solitaire")
  })

  test("Esc cancels", async () => {
    const { onDone } = await prompt(["@te", KEY.escape])
    expect(onDone).toHaveBeenCalledWith(undefined)
  })
})
