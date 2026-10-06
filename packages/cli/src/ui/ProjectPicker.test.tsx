import { render } from "ink-testing-library"
import { describe, test, expect, vi } from "vite-plus/test"

import { CLI } from "$/cli"

const ROOT = {
  kind: "root",
  arg: "@test",
  title: "Test fixtures",
  projectIds: ["@test:fixtures:FizzBuzz", "@test:fixtures:Solitaire"]
} as const satisfies CLI.CliProject

const DOWN = "\u001B[B"
const ENTER = "\r"
const ESCAPE = "\u001B"

/** Let Ink see the input just written. */
const settle = () => new Promise((done) => setTimeout(done, 20))

/** Draw a `<ProjectPicker>` for `ROOT`, then type each of `keys`. */
async function pickWith(...keys: string[]) {
  const onPick = vi.fn()
  const { stdin, lastFrame, unmount } = render(
    <CLI.ProjectPicker root={{ ...ROOT, projectIds: [...ROOT.projectIds] }} onPick={onPick} />
  )
  await settle()
  for (const key of keys) {
    stdin.write(key)
    await settle()
  }
  const frame = lastFrame()
  unmount()
  return { onPick, frame }
}

describe("<ProjectPicker>", () => {
  test("offers All projects first, then each by name", async () => {
    const { frame } = await pickWith()
    expect(frame).toMatch(/Which Test fixtures project\?\n❯ All projects \(2\)\n {2}FizzBuzz {2}@test:fixtures\n/)
  })

  test("Enter on All projects picks every one", async () => {
    const { onPick } = await pickWith(ENTER)
    expect(onPick).toHaveBeenCalledWith(ROOT.projectIds)
  })

  test("picks just one", async () => {
    const { onPick } = await pickWith(DOWN, DOWN, ENTER)
    expect(onPick).toHaveBeenCalledWith(["@test:fixtures:Solitaire"])
  })

  test("Esc cancels", async () => {
    const { onPick } = await pickWith(ESCAPE)
    expect(onPick).toHaveBeenCalledWith([])
  })
})
