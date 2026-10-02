/**
 * Starting things outside the goals tools:  the goals server, a browser window, VS Code's preview, and Claude Code
 * sessions in a terminal window.
 * - macOS first:  terminals, browsers and VS Code are driven with `osascript` / `open`.  Elsewhere,
 *   `runInTerminal()` throws a `LaunchError` carrying the command, so the caller can show it to run by hand.
 * - NEVER builds a shell command from free text:  a target is resolved (`targets.js`) before it reaches a command
 *   line, and every argument is single-quoted.
 */
import { spawn, spawnSync } from "node:child_process"
import { existsSync, openSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { delimiter, join } from "node:path"

import { GOALS, ROOT } from "./targets.js"

/** Where the running server says where it is:  `{ pid, port, goals, started }`. */
export const SERVER_FILE = join(GOALS, ".server.json")
/** The background server's output. */
const SERVER_LOG = join(GOALS, ".server.log")
/** The server script. */
const SERVER = join(GOALS, "_tools/server.js")

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

////////////////
// ## Browser and VS Code
////////////////

/**
 * Show `url` in a NEW browser window.
 * - `prefs.browser`:  "Google Chrome" or "Safari" (macOS, by AppleScript), else the system's default browser
 */
export function openInBrowser(url, prefs) {
  if (process.platform === "darwin" && prefs.browser === "Google Chrome") {
    const script = `tell application "Google Chrome"
  activate
  set newWindow to make new window
  set URL of active tab of newWindow to ${appleString(url)}
end tell`
    if (spawnSync("osascript", ["-e", script]).status === 0) return "Google Chrome"
  }
  if (process.platform === "darwin" && prefs.browser === "Safari") {
    const script = `tell application "Safari"
  activate
  make new document with properties {URL:${appleString(url)}}
end tell`
    if (spawnSync("osascript", ["-e", script]).status === 0) return "Safari"
  }
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open"
  spawn(opener, [url], { detached: true, stdio: "ignore" }).unref()
  return "the default browser"
}

/**
 * Show `url` in VS Code's Simple Browser, beside the editor:  the spell extension's `DocPreview` URI handler
 * (`packages/vscode/src/DocPreview.ts`), which takes a goals-server `url`, or a `file` to serve itself.
 * - needs the spell extension:  `yarn vscode` at the repo root
 */
export function openInVSCode(url, file) {
  const query = new URLSearchParams({ url, file }).toString()
  const uri = `vscode://spell-app.spell-language/doc-preview?${query}`
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open"
  const run = spawnSync(opener, [uri], { encoding: "utf8" })
  if (run.status !== 0) throw new LaunchError(`VS Code didn't open it:  ${run.stderr?.trim() ?? run.error}`)
  return "VS Code"
}

////////////////
// ## Goals server
////////////////

/**
 * The goals server for this goals folder, started in the background if it isn't running:  `{ port, base, started }`.
 * - running means:  `.server.json`'s process answers `/api/ping` for THIS goals folder
 * - SIDE EFFECT:  may start `server.js` detached, logging to `.server.log`
 */
export async function ensureServer(prefs) {
  const running = await serverStatus()
  if (running) return { ...running, started: false }
  const log = openSync(SERVER_LOG, "a")
  spawn(process.execPath, [SERVER], { cwd: ROOT, detached: true, stdio: ["ignore", log, log] }).unref()
  for (let tries = 0; tries < 50; tries++) {
    await new Promise((done) => setTimeout(done, 100))
    const status = await serverStatus()
    if (status) return { ...status, started: true }
  }
  throw new LaunchError(`the goals server didn't start on port ${prefs.server.port}:  see ${SERVER_LOG}`)
}

/** The running server's `{ pid, port, base }`, or `undefined`. */
export async function serverStatus() {
  if (!existsSync(SERVER_FILE)) return undefined
  let info
  try {
    info = JSON.parse(readFileSync(SERVER_FILE, "utf8"))
  } catch {
    return undefined
  }
  const base = `http://127.0.0.1:${info.port}`
  try {
    const answer = await (await fetch(`${base}/api/ping`, { signal: AbortSignal.timeout(1000) })).json()
    return answer.goals === GOALS ? { pid: info.pid, port: info.port, base } : undefined
  } catch {
    return undefined
  }
}

/** Stop the running server, if any;  returns whether one was stopped. */
export async function stopServer() {
  const running = await serverStatus()
  if (!running) return false
  process.kill(running.pid, "SIGTERM")
  return true
}
