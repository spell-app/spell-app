import { render } from "ink-testing-library"
import { describe, test, expect } from "vite-plus/test"

import { CLI } from "$/cli"

const ENTER = "\r"
const UP = "\u001B[A"

/** Let Ink see the input just written. */
const settle = () => new Promise((done) => setTimeout(done, 20))

/** Draw a `<ReplScreen>` parsing in a fresh scope, then type each of `keys`.  Returns the last frame. */
async function typeInto(...keys: string[]) {
  const scope = CLI.lineScope()
  const { stdin, lastFrame, unmount } = render(
    <CLI.ReplScreen
      title="spell repl"
      onLine={(text) => CLI.parseText(text, scope, { commit: true })}
      size={{ rows: 40 }}
    />
  )
  await settle()
  for (const key of keys) {
    stdin.write(key)
    await settle()
  }
  const frame = lastFrame()!
  unmount()
  return frame
}

describe("<ReplScreen>", () => {
  test("starts empty:  title, input, keys", async () => {
    const frame = await typeInto()
    expect(frame).toMatch(/^spell repl\n› *\nEnter parse/)
  })

  test("each line shows its tree and javascript -- and later lines know what it declared", async () => {
    const frame = await typeInto("x is 3", ENTER, "print x", ENTER)
    expect(frame).toContain("› x is 3\n")
    expect(frame).toContain("=> export let x = 3\n")
    expect(frame).toContain("expression › known_variable  x\n")
    expect(frame).toContain("=> spellCore.console.log(x)\n")
  })

  test("a line that doesn't parse says so", async () => {
    expect(await typeInto("flibber the wombat", ENTER)).toContain("Doesn't parse as statement or expression")
  })

  test("↑ brings back the last line", async () => {
    const frame = await typeInto("print 1", ENTER, UP)
    expect(frame).toMatch(/\n› print 1\nEnter parse/)
  })
})
