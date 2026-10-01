/**
 * `yarn stop`:  stop every server started from this repo -- `yarn start`, vite, the express server and its
 * `tsx watch` -- EXCEPT the language server (`src/lsp/server.ts`), which an editor started and would lose.
 * - Finds them by command line:  anything run from this package's or the monorepo's `node_modules` copy of
 *   `concurrently`, `vite` or `tsx`, so servers from other checkouts, and test runs (`vitest`), are left alone.
 * - SIGTERM, like `pkill`.
 */
import { execFileSync } from "child_process"
import { dirname } from "path"

const root = process.cwd()
// yarn hoists to the monorepo root, so look in this package's `node_modules` and every parent's
const modules = []
for (let folder = root; ; folder = dirname(folder)) {
  modules.push(`${escapeRegExp(folder)}/node_modules`)
  if (dirname(folder) === folder) break
}
const ours = new RegExp(`(${modules.join("|")})/(concurrently/|vite/|tsx/|\\.bin/tsx)`)
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
