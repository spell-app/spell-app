import { describe, expect, test } from "vite-plus/test"

import { orphanServers, parseLsof, parsePs, pruneReport, type ServerProcess } from "$/server/page"

const NODE = "/usr/local/bin/node"
const TREES = "/repo/.claude/worktrees"

/** A page server of `root`, as `ps` shows it. */
function pageServer(pid: number, root: string, cwd: string | undefined = root): ServerProcess {
  const command = `${NODE} --import tsx ${root}/packages/server/src/page/cli.ts serve --root ${root} --port 4747`
  return { pid, command, ...(cwd && { cwd }), port: 4747 + pid }
}

/** The editor's vite dev server, of `root`. */
function vite(pid: number, root: string): ServerProcess {
  const command = `${NODE} ${root}/node_modules/vite-plus/bin/vp dev --port 6400${pid} --strictPort`
  return { pid, command, cwd: `${root}/packages/app` }
}

/** The folders that still exist:  `main` and the `live` worktree. */
const EXISTING = new Set(["/repo", `${TREES}/live`, `${TREES}/live/packages/app`])

describe("orphanServers()", () => {
  test("the page and vite servers of a GONE checkout;  never one whose checkout exists", () => {
    const processes = [
      vite(1, `${TREES}/gone`),
      pageServer(2, `${TREES}/gone`),
      pageServer(3, "/repo"),
      pageServer(4, `${TREES}/live`),
      vite(5, `${TREES}/live`),
      { pid: 6, command: `${NODE} ${TREES}/gone/node_modules/.bin/tsc --watch`, cwd: `${TREES}/gone` }
    ]
    const orphans = orphanServers(processes, (path) => EXISTING.has(path))
    expect(orphans.map(({ pid, kind, checkout }) => ({ pid, kind, checkout }))).toEqual([
      { pid: 2, kind: "page", checkout: `${TREES}/gone` },
      { pid: 1, kind: "vite", checkout: `${TREES}/gone` }
    ])
  })

  test("a server whose working folder still exists is NOT an orphan, whatever its command says", () => {
    const moved = pageServer(1, `${TREES}/gone`, `${TREES}/live`)
    expect(orphanServers([moved], (path) => EXISTING.has(path))).toEqual([])
  })

  test("the checkout comes from the working folder when the command names none", () => {
    const bare = { pid: 1, command: "node node_modules/vite-plus/bin/vp dev", cwd: `${TREES}/gone/packages/app` }
    expect(orphanServers([bare], (path) => EXISTING.has(path))[0]?.checkout).toBe(`${TREES}/gone/packages/app`)
  })
})

describe("parsePs() / parseLsof()", () => {
  test("pid and command per line;  each pid's names, in order", () => {
    expect(parsePs("  135 node a.js serve\n 2329 vp dev --port 1\n")).toEqual([
      { pid: 135, command: "node a.js serve" },
      { pid: 2329, command: "vp dev --port 1" }
    ])
    expect(parseLsof("p135\nfcwd\nn/repo/gone\np155\nf12\nn127.0.0.1:4748\nn[::1]:4748\n")).toEqual(
      new Map([
        [135, ["/repo/gone"]],
        [155, ["127.0.0.1:4748", "[::1]:4748"]]
      ])
    )
  })
})

describe("pruneReport()", () => {
  test("grouped by checkout, with each server's port when known", () => {
    const orphans = orphanServers([pageServer(2, `${TREES}/gone`), vite(1, `${TREES}/gone`)], () => false)
    expect(pruneReport(orphans, { dryRun: true }).split("\n")).toEqual([
      "would stop 2 servers of 1 removed checkout:",
      `  ${TREES}/gone`,
      "    page  pid 2  port 4749",
      "    vite  pid 1"
    ])
    expect(pruneReport([])).toBe("no servers left by removed checkouts")
  })
})
