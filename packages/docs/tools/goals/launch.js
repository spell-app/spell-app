/**
 * Starting Claude Code sessions in a terminal window, for the goals tools and their pages' buttons.
 * - The server, browser windows and VS Code's preview are `$/server`'s:  the page server (`PageServer.ensure()`),
 *   `SRV.openInNewWindow()`, `SRV.openInVSCode()`.
 * - macOS first:  terminals, browsers and VS Code are driven with `osascript` / `open`.  Elsewhere,
 *   `runInTerminal()` throws a `LaunchError` carrying the command, so the caller can show it to run by hand.
 * - NEVER builds a shell command from free text:  a target is resolved (`targets.js`) before it reaches a command
 *   line, and every argument is single-quoted.
 */
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { delimiter, join } from "node:path"

import { ROOT } from "./targets.js"

/** The skills a page or `spell goals` may start, by name:  only these reach a command line. */
export const SKILLS = ["goals", "goals-update"]

/** A launch that couldn't happen here;  `command` is what to run by hand instead, if any. */
export class LaunchError extends Error {
  constructor(message, command) {
    super(message)
    this.command = command
  }
}

////////////////
// ## Claude Code
////////////////

/**
 * Whether Claude Code is installed and logged in:  `{ installed, version, loggedIn, authMethod }`.
 * - runs `claude --version` and `claude auth status --json`;  NEVER passes on the account's email or org
 */
export function claudeStatus(prefs) {
  const command = claudePath(prefs)
  if (!command) return { installed: false, loggedIn: false }
  const version = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 10_000 })
  if (version.error) return { installed: false, loggedIn: false }
  const auth = spawnSync(command, ["auth", "status", "--json"], { encoding: "utf8", timeout: 20_000 })
  let status = {}
  try {
    status = JSON.parse(auth.stdout)
  } catch {
    // an older Claude Code without `auth status`:  assume logged in, and let the session ask
    status = { loggedIn: auth.status === 0 }
  }
  return {
    installed: true,
    version: version.stdout.trim().split(/\s/)[0],
    loggedIn: Boolean(status.loggedIn),
    authMethod: status.authMethod,
    path: command
  }
}

/** Places Claude Code's installers put it, besides `PATH`. */
const CLAUDE_HOMES = [
  join(homedir(), ".local/bin"),
  join(homedir(), ".claude/local"),
  "/opt/homebrew/bin",
  "/usr/local/bin"
]

/** `claudePath()`'s answer, once found. */
let claudeFound

/**
 * The Claude Code to run:  `prefs.claude.command` when it's a path, else the NEWEST `claude` on `PATH` or in
 * `CLAUDE_HOMES`;  `undefined` when there's none.
 * - newest, not first:  a Node version manager may put an old npm-installed `claude` first on a Node process's
 *   `PATH` (Volta does), while a terminal finds the current one
 */
export function claudePath(prefs) {
  const command = prefs.claude.command
  if (command.includes("/")) return existsSync(command) ? command : undefined
  if (claudeFound !== undefined) return claudeFound || undefined
  const dirs = [...(process.env.PATH ?? "").split(delimiter), ...CLAUDE_HOMES].filter(Boolean)
  let best
  for (const file of new Set(dirs.map((dir) => join(dir, command)))) {
    if (!existsSync(file)) continue
    const run = spawnSync(file, ["--version"], { encoding: "utf8", timeout: 10_000 })
    const version = run.stdout?.match(/\d+(\.\d+)+/)?.[0]
    if (version && (!best || newer(version, best.version))) best = { file, version }
  }
  claudeFound = best?.file ?? ""
  return best?.file
}

/** Whether dotted version `a` is newer than `b`. */
function newer(a, b) {
  const [x, y] = [a, b].map((version) => version.split(".").map(Number))
  for (let i = 0; i < Math.max(x.length, y.length); i++)
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0)
  return false
}

/**
 * The command line that starts Claude Code on `/<skill> <target>`, e.g. `claude '/goals spell/motivation/G1'`.
 * - `print`:  headless (`-p`):  runs to the end with no questions, printing what it did
 */
export function claudeCommand(skill, targetName, prefs, { print = false } = {}) {
  if (!SKILLS.includes(skill)) throw new LaunchError(`no skill "${skill}":  ${SKILLS.join(" / ")}`)
  const words = [claudePath(prefs) ?? prefs.claude.command, ...prefs.claude.args, ...(print ? ["-p"] : [])]
  return [...words.map(quote), quote(`/${skill}${targetName ? ` ${targetName}` : ""}`)].join(" ")
}

/** `text` single-quoted for a POSIX shell. */
export function quote(text) {
  return /^[\w@%+=:,./-]+$/.test(text) ? text : `'${String(text).replace(/'/g, `'\\''`)}'`
}

/**
 * Run `commandLine` in a NEW terminal window, in `cwd` (default:  the project root).  Returns how:  the app's name.
 * - `prefs.terminal`:  "Terminal" or "iTerm"
 * - not macOS:  throws a `LaunchError` with the command, to run by hand
 * - `GOALS_DRY_RUN` set:  starts nothing, and says what it would have run
 */
export function runInTerminal(commandLine, prefs, cwd = ROOT) {
  const line = `cd ${quote(cwd)} && ${commandLine}`
  // tests:  say what would run, start nothing
  if (process.env.GOALS_DRY_RUN) return `dry run (${line})`
  if (process.platform !== "darwin") throw new LaunchError("can't open a terminal window here:  run it yourself", line)
  const app = prefs.terminal === "iTerm" ? "iTerm" : "Terminal"
  const script =
    app === "iTerm"
      ? `tell application "iTerm"
  activate
  set newWindow to (create window with default profile)
  tell current session of newWindow to write text ${appleString(line)}
end tell`
      : `tell application "Terminal"
  activate
  do script ${appleString(line)}
end tell`
  const run = spawnSync("osascript", ["-e", script], { encoding: "utf8" })
  if (run.status !== 0) throw new LaunchError(`${app} didn't start it:  ${run.stderr.trim()}`, line)
  return app
}

/** `text` as an AppleScript string literal. */
function appleString(text) {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}
