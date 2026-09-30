/**
 * `yarn stop`:  stop every server started from this repo -- `yarn start`, vite, the express server and its
 * `tsx watch` -- EXCEPT the language server (`src/lsp/server.ts`), which an editor started and would lose.
 * - Finds them by command line:  anything run from THIS repo's `node_modules` copy of `concurrently`, `vite`
 *   or `tsx`, so servers from other checkouts, and test runs (`vitest`), are left alone.
 * - SIGTERM, like `pkill`.
 */
import { execFileSync } from "child_process"

const root = process.cwd()
const ours = new RegExp(`${escapeRegExp(root)}/node_modules/(concurrently/|vite/|tsx/|\\.bin/tsx)`)
const languageServer = "/src/lsp/server.ts"

const stopped = []
for (const line of execFileSync("ps", ["-Ao", "pid=,command="], { encoding: "utf8" }).split("\n")) {
  const [, pid, command] = /^\s*(\d+)\s+(.*)$/.exec(line) ?? []
  if (!pid || Number(pid) === process.pid || !ours.test(command) || command.includes(languageServer)) continue
  try {
    process.kill(Number(pid), "SIGTERM")
    stopped.push(pid)
  } catch {
    // gone already, e.g. a child of one we just stopped
  }
}
console.log(stopped.length ? `Stopped spell servers:  ${stopped.join(", ")}` : "No spell servers running")

/** `text` with regex specials escaped, to match literally. */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
