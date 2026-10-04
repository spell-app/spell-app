/**
 * `yarn stop`:  stop every server started from this repo -- `yarn start`, vite, the express server and its
 * `tsx watch` -- EXCEPT the language server (`src/lsp/server.ts`), which an editor started and would lose.
 * - Finds them by command line:  anything run from this package's or this checkout's root `node_modules` copy of
 *   `concurrently`, `vite`, `tsx` or `vite-plus` running `vp dev` (yarn hoists them to the root), so servers from
 *   other checkouts, and test runs (`vp test`), are left alone.
 * - ...then by working folder:  only processes running IN this package, since `ui`'s and its docs site's dev servers
 *   run the same hoisted `vite`.
 * - SIGTERM, like `pkill`.
 */
import { execFileSync } from "child_process"
import { resolve } from "path"

const root = process.cwd()
const monorepo = resolve(root, "../..")
const ours = new RegExp(
  `(${escapeRegExp(root)}|${escapeRegExp(monorepo)})/node_modules/(concurrently/|vite/|tsx/|\\.bin/tsx|vite-plus/bin/vp dev\\b)`
)
const languageServer = "/packages/lsp/src/server.ts"

const candidates = []
for (const line of execFileSync("ps", ["-Ao", "pid=,command="], { encoding: "utf8" }).split("\n")) {
  const [, pid, command] = /^\s*(\d+)\s+(.*)$/.exec(line) ?? []
  if (!pid || Number(pid) === process.pid || !ours.test(command) || command.includes(languageServer)) continue
  candidates.push(pid)
}

const stopped = []
for (const pid of candidates) {
  const folder = workingFolder(pid)
  if (folder !== root && !folder?.startsWith(`${root}/`)) continue
  try {
    process.kill(Number(pid), "SIGTERM")
    stopped.push(pid)
  } catch {
    // gone already, e.g. a child of one we just stopped
  }
}
console.log(stopped.length ? `Stopped spell servers:  ${stopped.join(", ")}` : "No spell servers running")

/** Working folder of process `pid`, or `undefined` once it's gone. */
function workingFolder(pid) {
  try {
    const out = execFileSync("lsof", ["-a", "-d", "cwd", "-Fn", "-p", pid], { encoding: "utf8" })
    return /^n(.*)$/m.exec(out)?.[1]
  } catch {
    return undefined
  }
}

/** `text` with regex specials escaped, to match literally. */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
