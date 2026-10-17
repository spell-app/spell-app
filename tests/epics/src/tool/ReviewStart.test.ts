/**
 * Tests of `ReviewStart.wake()` (epic `epic-workflow` P16):  who a wake reaches, on a fake window registry and bridge,
 * with `epic window launch` stubbed.  The routes' cases (Send, Do Now, the cooldown) are `reviewRoutes.test.ts`'s.
 * - NEVER the real `~/.claude` or `~/.spell`:  a wake types into VS Code
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { createServer, type Server } from "node:http"
import type { AddressInfo } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, beforeEach, expect, test } from "vite-plus/test"

import { ReviewStart } from "$/epics/tool/ReviewStart"
import { fakeMainCheckout, fakeWorktree } from "$/server/test/checkouts"

let home: string
let root: string
let bridge: Server
let bridgePort: number
/** what the fake bridge was asked:  `[op, body]` */
const asked: [string, unknown][] = []
/** the fake bridge's answer:  ok, or refused */
let refuse = false
/** what `launch` was asked:  `[args, cwd]` */
const launched: [string[], string][] = []

beforeAll(async () => {
  home = mkdtempSync(join(tmpdir(), "review-wake-"))
  root = fakeMainCheckout(mkdtempSync(join(tmpdir(), "review-wake-root-")))
  mkdirSync(join(home, "sessions"))
  mkdirSync(join(home, "windows"))
  process.env.SPELL_CLAUDE_HOME = home
  process.env.SPELL_WINDOWS_DIR = join(home, "windows")
  bridge = createServer((request, response) => {
    let text = ""
    request.on("data", (chunk) => (text += chunk))
    request.on("end", () => {
      asked.push([request.url!.slice(1), JSON.parse(text)])
      response.setHeader("content-type", "application/json")
      response.statusCode = refuse ? 409 : 200
      response.end(JSON.stringify(refuse ? { ok: false, error: "no thanks" } : { ok: true }))
    })
  })
  await new Promise<void>((done) => bridge.listen(0, "127.0.0.1", done))
  bridgePort = (bridge.address() as AddressInfo).port
})

afterAll(() => {
  bridge.close()
  delete process.env.SPELL_CLAUDE_HOME
  delete process.env.SPELL_WINDOWS_DIR
  rmSync(home, { recursive: true, force: true })
  rmSync(root, { recursive: true, force: true })
})

beforeEach(() => {
  asked.splice(0)
  launched.splice(0)
  refuse = false
  rmSync(join(home, "windows", `${process.pid}.json`), { force: true })
  rmSync(join(root, ".claude"), { recursive: true, force: true })
})

/** a `ReviewStart` on the scratch checkout `at` (default:  its root), `launch` recorded, never run */
function starter(at = root) {
  return new ReviewStart(at, { launch: (args, cwd) => void launched.push([args, cwd]), airplane: () => false })
}

/** this process's window, showing `folders` */
function window(folders: string[], workspaceFile: string | null = null) {
  const entry = { pid: process.pid, port: bridgePort, token: "t", workspaceFile, folders }
  writeFileSync(join(home, "windows", `${process.pid}.json`), JSON.stringify(entry))
}

/** epic `name`'s worktree, made in the scratch checkout as git leaves one */
function worktree(name: string): string {
  return fakeWorktree(root, join(root, ".claude", "worktrees", name))
}

test("a worktree, its window closed:  `epic window launch <epic>`, from the main checkout, the command as its prompt", async () => {
  worktree("big")
  window([root])
  const wake = await starter().wake("big")
  expect(wake).toMatchObject({
    state: "launched",
    did: "opened big's window",
    message: "Opened big's window:  press Enter on /epic review big there."
  })
  expect(launched).toEqual([[["launch", "big", "--prompt", "/epic review big"], root]])
  expect(asked).toEqual([])
})

test("the worktree's window found by its window file, too (`workspaces/ongoing/<epic>.code-workspace`)", async () => {
  worktree("big")
  mkdirSync(join(root, "workspaces", "ongoing"), { recursive: true })
  const file = join(root, "workspaces", "ongoing", "big.code-workspace")
  writeFileSync(file, "{}")
  window([root], file)
  expect((await starter().wake("big")).state).toBe("opened")
  expect(asked).toEqual([["open-session", { prompt: "/epic review big" }]])
  expect(launched).toEqual([])
})

test("from a worktree's page server:  the main checkout's worktrees and windows", async () => {
  const other = worktree("other")
  window([root])
  const wake = await starter(other).wake("future-thing")
  expect(wake.state).toBe("opened")
  expect(asked).toEqual([["open-session", { prompt: "/epic review future-thing" }]])
})

test("a main window is one whose first folder is the main checkout, with no worktree among its folders", async () => {
  const other = worktree("other")
  window([root, other])
  expect((await starter().wake("future-thing")).state).toBe("no-vscode")
  window([join(root, "packages")])
  expect((await starter().wake("future-thing")).state).toBe("no-vscode")
  expect(asked).toEqual([])
})

test("a window that refuses:  `failed`, in words, nothing kept", async () => {
  window([root])
  refuse = true
  const wake = await starter().wake("big")
  expect(wake).toMatchObject({ state: "failed", did: "" })
  expect(wake.message).toMatch(
    /^Couldn't wake big:  the session's window refused:  no thanks\.  Type \/epic review big/
  )
})
