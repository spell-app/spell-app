import { render } from "ink-testing-library"
import { describe, test, expect, vi } from "vite-plus/test"

import { CLI } from "$/cli"

const KEY = { down: "\u001B[B", tab: "\t", enter: "\r", escape: "\u001B" }

/** Let Ink -- and the choices, worked out async -- catch up with the input just written. */
const settle = () => new Promise((done) => setTimeout(done, 60))

/** Draw a `<ProjectPrompt>` with `recents`, type each of `keys`, and return the last frame and what it picked. */
async function prompt(keys: string[], recents: string[] = []) {
  const onDone = vi.fn()
  const { stdin, lastFrame, unmount } = render(
    <CLI.ProjectPrompt choicesFor={(text) => CLI.projectChoices(text, recents)} onDone={onDone} />
  )
  await settle()
  for (const key of keys) {
    stdin.write(key)
    await settle()
  }
  const frame = lastFrame() ?? ""
  unmount()
  return { frame, onDone }
}

describe("<ProjectPrompt>", () => {
  test("starts with recent picks, then the roots", async () => {
    const { frame } = await prompt([], ["@test/FizzBuzz"])
    expect(frame).toMatch(/^Which project or file\? {2}█\n❯ @test\/FizzBuzz {2}\(recent\)\n {2}@user\//)
  })

  test("Tab completes as far as the choices agree", async () => {
    const { frame } = await prompt(["@te", KEY.tab])
    expect(frame).toMatch(
      /^Which project or file\? {2}@test\/█\n❯ @test\/Cards\/\n {2}@test\/FizzBuzz\/\n {2}@test\/Klondike\/\n {2}@test\/OutlineSolitaire\/\n {2}@test\/Solitaire\//
    )
  })

  test("Enter goes into a root, then a project -- entire project first -- and picks", async () => {
    const { frame, onDone } = await prompt(["@test/", KEY.down, KEY.down, KEY.down, KEY.down, KEY.enter])
    expect(frame).toMatch(
      /@test\/Solitaire\/█\n❯ @test\/Solitaire {2}entire project\n {2}@test\/Solitaire\/Card\.spell/
    )
    expect(onDone).not.toHaveBeenCalled()

    const picked = await prompt(["@test/Solitaire/", KEY.down, KEY.enter])
    expect(picked.onDone).toHaveBeenCalledWith("@test/Solitaire/Card.spell")
    const whole = await prompt(["@test/Solitaire/", KEY.enter])
    expect(whole.onDone).toHaveBeenCalledWith("@test/Solitaire")
  })

  test("Enter on a recent pick picks it", async () => {
    const { onDone } = await prompt([KEY.enter], ["@test/FizzBuzz"])
    expect(onDone).toHaveBeenCalledWith("@test/FizzBuzz")
  })

  test("keys arriving together, e.g. typed while choices load, still complete in order", async () => {
    const { onDone } = await prompt(["@te\tSol\t\r"])
    expect(onDone).toHaveBeenCalledWith("@test/Solitaire")
  })

  test("Esc cancels", async () => {
    const { onDone } = await prompt(["@te", KEY.escape])
    expect(onDone).toHaveBeenCalledWith(undefined)
  })
})
