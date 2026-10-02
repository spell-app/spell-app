#!/usr/bin/env node
/**
 * `yarn window <command>`:  the VS Code windows Owen works in, one per package.
 *
 * ## Window files
 * - `packages/<pkg>/<pkg>.code-workspace`:  open a package's window from it (`code packages/ui/ui.code-workspace`).
 * - Its FIRST folder is the repo root, its second the package.  Why:  the Claude Code panel lists only the sessions
 *   saved under a window's first folder, so with the root first, every window lists every session.
 * - Its own colour theme, so windows are told apart at a glance (instead of VS Code profiles).
 * - The root folder hides `packages/` and `.claude/worktrees/`:  the package folder is the window's focus.
 * - A saved workspace can gain and lose folders (a worktree, while a session works in it) without restarting
 *   extensions;  a one-folder window can't, and its Claude panel restarts.
 *
 * ## The window a session runs in
 * - The spell extension (`packages/vscode/src/WindowBridge.ts`) runs a small server in EVERY window and writes
 *   `~/.spell/windows/<pid>.json` (`{ pid, port, token, workspaceFile, folders }`), `pid` being the window's
 *   extension host.
 * - A Claude Code session is a child of that extension host, so `Window.current()` walks up this process's parent
 *   pids to the first one with a registry file.  Not a session (a terminal's shell is a child of VS Code's pty
 *   host, not the extension host):  the window with `process.cwd()` in one of its folders after the first.
 * - Then `Window.request(op, body)` asks THAT window, not the focused one (which is what a `vscode://` URI gets).
 * - `import { Window } from "<relative path>/scripts/window.mjs"`:  the CLI runs only when this file is run.
 * - Tests:  `node --test scripts/window.test.mjs`.  `SPELL_WINDOWS_DIR` overrides the registry folder.
 *
 * ## A worktree's window
 * - `/isolate` and `/plan-doc` open a worktree in a NEW window (`open <name>`).
 * - Then the session MOVES there (`handoff <name>`):  when its turn ends, the worktree's window opens it in an
 *   editor tab (never the sidebar), and the old window closes its tab.
 * - On leaving, it moves BACK (`handoff <name> --back`):  its package's window opens it, and the worktree's window
 *   closes (its file deleted).  `close <name>` just closes the window:  for a session that never moved there.
 *   - A session can't move processes:  the new tab RESUMES it (same session id), and closing the old tab ends the
 *     old `claude` process.  The resumed session goes back into its worktree by itself (Claude records
 *     `worktree-state` in the transcript).
 *   - Why wait for the turn to end:  until then the old process is still writing the transcript, and the new tab
 *     would load it half-written.  The repo's `Stop` hook (`.claude/hooks/handoff.mjs`) starts `resume`, detached,
 *     since closing the old tab kills the hook's own `claude`.
 *   - The old tab is found by its label, the session's title.  No single match (two sessions with one title):  it
 *     stays open, idle;  close it by hand.
 *   - Log:  `<registry>/handoffs/<session id>.log`.
 * - Its file:  `.claude/worktrees/<name>.code-workspace`, beside the worktree, so git ignores it in both checkouts.
 * - Folders:  the MAIN repo root first, as in every window, so its Claude panel lists every session;  then the
 *   worktree's `packages/<pkg>` and the worktree's root (whose `packages/` is hidden, as the main root's is).
 * - The package window's theme, title bar tinted in a colour of the worktree's own (from its name):  told apart at a
 *   glance from the package window, and from other worktrees.
 *
 * ## Commands
 * - `init`:  write the window file of every package that lacks one;  never overwrites (themes are Owen's to change)
 * - `which`:  this session's window:  pid, workspace file, folders
 * - `add <path> [--name <name>]`:  add a folder (a worktree) to the window;  needs a window opened from its
 *   `.code-workspace` (else the change would restart its extensions, Claude panel included)
 * - `remove <path>`:  remove that folder again;  never the window's first
 * - `show <file>`:  show an `.html` doc in the window's Simple Browser, beside the editor
 * - `open <name> [--pkg <pkg>]`:  write worktree `<name>`'s window file and open it in a new window;  `<pkg>`
 *   defaults to this session's window's package.  `close <name>`:  close that window, delete the file.
 * - `handoff <name> [--back]`:  move this session to worktree `<name>`'s window when its turn ends;  `--back`:
 *   from it to its package's window, closing it after.  Needs `$CLAUDE_CODE_SESSION_ID` (Claude sets it in a
 *   session's commands).
 * - `resume <record> [--title <title>]`:  the move itself, run by the `Stop` hook:  `<record>` the handoff's file
 *   (deleted once read), `<title>` the session's tab's label
 * - No window (the extension isn't installed, or the window wasn't reloaded since):  exits 1, saying so.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

/** The repo root:  a worktree's own, when run from one. */
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** The MAIN checkout's root, even when run from a worktree:  where `.claude/worktrees/` is. */
const MAIN_ROOT = mainRoot(ROOT)

/** Each package's starting theme:  VS Code's built-ins, all different.  Owen picks real ones in the files. */
const THEMES = {
  app: "Abyss",
  cli: "Kimbie Dark",
  core: "Monokai",
  docs: "Monokai Dimmed",
  lsp: "Red",
  parser: "Solarized Dark",
  "solid-element": "Solarized Light",
  spell: "Quiet Light",
  ui: "Tomorrow Night Blue",
  util: "Default Dark Modern",
  vscode: "Default Light Modern"
}

/** A package that isn't in `THEMES`. */
const FALLBACK_THEME = "Default Dark+"

/** How long a window gets to answer a request, in msec:  `show-doc` may start a server first. */
const REQUEST_TIMEOUT = 10_000

/** How long `resume` waits for a worktree's window to start, in msec. */
const WINDOW_START_TIMEOUT = 60_000

/** A Claude Code session id:  a uuid. */
const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/****************
 * ### `Window`
 * The window files, and the window a session runs in.
 ****************/
export class Window {
  /** Package names:  the folders of `packages/` with a `package.json`. */
  static get packages() {
    const packages = join(ROOT, "packages")
    return readdirSync(packages, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(packages, entry.name, "package.json")))
      .map((entry) => entry.name)
      .sort()
  }

  /** `packages/<pkg>/<pkg>.code-workspace`. */
  static file(pkg) {
    return join(ROOT, "packages", pkg, `${pkg}.code-workspace`)
  }

  /** The window file's contents for `pkg`. */
  static workspace(pkg) {
    return {
      folders: [
        { path: "../..", name: "spell-app" },
        { path: ".", name: pkg }
      ],
      settings: {
        "workbench.colorTheme": THEMES[pkg] ?? FALLBACK_THEME,
        "files.exclude": { packages: true, ".claude/worktrees": true }
      }
    }
  }

  /** `init`:  write the missing window files;  returns the paths written. */
  static init() {
    const written = []
    for (const pkg of Window.packages) {
      const file = Window.file(pkg)
      if (existsSync(file)) continue
      writeFileSync(file, `${JSON.stringify(Window.workspace(pkg), null, 2)}\n`)
      written.push(relative(ROOT, file))
    }
    return written
  }

  ////////////////
  // ## A worktree's window
  ////////////////

  /** `.claude/worktrees/<name>.code-workspace`, in the main checkout. */
  static worktreeFile(name) {
    return join(MAIN_ROOT, ".claude", "worktrees", `${name}.code-workspace`)
  }

  /**
   * The window file of worktree `name`, focused on `pkg`.
   * - folder paths are relative to `.claude/worktrees/`
   */
  static worktreeWorkspace(pkg, name) {
    return {
      folders: [
        { path: "../..", name: "spell-app" },
        { path: `${name}/packages/${pkg}`, name: `${pkg} ⎇ ${name}` },
        { path: name, name: `spell-app ⎇ ${name}` }
      ],
      settings: {
        "workbench.colorTheme": Window.theme(pkg),
        "files.exclude": { packages: true, ".claude/worktrees": true },
        "workbench.colorCustomizations": tint(name)
      }
    }
  }

  /** `pkg`'s theme:  from its window file in the main checkout (Owen may have changed it), else `THEMES`. */
  static theme(pkg) {
    try {
      const file = join(MAIN_ROOT, "packages", pkg, `${pkg}.code-workspace`)
      const theme = JSON.parse(readFileSync(file, "utf8")).settings?.["workbench.colorTheme"]
      if (theme) return theme
    } catch {
      // missing, or JSONC VS Code's own parser would take:  the starting theme
    }
    return THEMES[pkg] ?? FALLBACK_THEME
  }

  /**
   * `open`:  (re)write worktree `name`'s window file and open it with `code`;  returns the file.
   * - already open:  VS Code focuses that window
   */
  static open(name, pkg) {
    if (!existsSync(join(MAIN_ROOT, ".claude", "worktrees", name))) throw new Error(`no worktree ${name}`)
    if (!Window.packages.includes(pkg)) throw new Error(`no package ${pkg}`)
    const file = Window.worktreeFile(name)
    writeFileSync(file, `${JSON.stringify(Window.worktreeWorkspace(pkg, name), null, 2)}\n`)
    const run = spawnSync("code", [file], { encoding: "utf8" })
    if (run.status !== 0) throw new Error(`\`code ${file}\` failed:  ${run.stderr || run.error?.message}`)
    return file
  }

  /**
   * `close`:  close worktree `name`'s window, if open, and delete its file;  returns whether a window closed.
   * - finds the window by its registry entry's `workspaceFile`
   */
  static async close(name) {
    const file = Window.worktreeFile(name)
    const window = Window.worktreeWindow(name)
    if (window) await Window.request("close-window", {}, window)
    rmSync(file, { force: true })
    return Boolean(window)
  }

  /** The registry entry of worktree `name`'s window, or `null` when it isn't open. */
  static worktreeWindow(name) {
    return Window.windowOf(Window.worktreeFile(name))
  }

  /** The registry entry of the window opened from workspace file `file`, or `null` when none is. */
  static windowOf(file) {
    file = real(file)
    for (const entry of Window.entries().values()) {
      if (entry.workspaceFile && real(entry.workspaceFile) === file) return entry
    }
    return null
  }

  ////////////////
  // ## Handing a session to a worktree's window
  ////////////////

  /** `<registry>/handoffs`:  pending moves (`<session id>.json`) and their logs (`<session id>.log`). */
  static get handoffs() {
    return join(Window.registry, "handoffs")
  }

  /** The pending move of session `sessionId`:  `<registry>/handoffs/<session id>.json`. */
  static handoffFile(sessionId) {
    return join(Window.handoffs, `${sessionId}.json`)
  }

  /**
   * `handoff`:  record that session `sessionId` moves to another window when its turn ends;  returns the record,
   * or `null` when it can't move back (see below).
   * - to worktree `name`'s window;  then this window closes the session's TAB
   * - `back`:  from worktree `name`'s window to its package's window;  then the worktree's window CLOSES and its
   *   file goes.  Not in that window (an older session, or the move there failed):  `null`, nothing to move.
   * - the record ~== `{ sessionId, to, from, close, remove }`:  `to` the target window's file, `from` this window's
   *   pid, `close` `"tab"` or `"window"`, `remove` a file to delete after
   */
  static handoff(name, sessionId, { back = false } = {}) {
    if (!SESSION_ID.test(sessionId ?? "")) throw new Error("no session:  $CLAUDE_CODE_SESSION_ID isn't set")
    const file = Window.worktreeFile(name)
    if (!existsSync(file)) throw new Error(`no window file for ${name}:  \`open ${name}\` first`)
    const from = Window.current()
    let handoff = { sessionId, to: file, from: from?.pid ?? null, close: "tab", remove: null }
    if (back) {
      if (!from?.workspaceFile || real(from.workspaceFile) !== real(file)) return null
      const pkg = worktreePackage(file)
      handoff = { sessionId, to: join(MAIN_ROOT, "packages", pkg, `${pkg}.code-workspace`), from: from.pid, close: "window", remove: file }
    }
    mkdirSync(Window.handoffs, { recursive: true, mode: 0o700 })
    writeFileSync(Window.handoffFile(sessionId), `${JSON.stringify(handoff, null, 2)}\n`, { mode: 0o600 })
    return handoff
  }

  /**
   * `resume`:  carry out `handoff` (a record), `title` being the session's tab's label;  returns what happened.
   * - opens window `to` (`code`, which just focuses it when open) and waits up to `WINDOW_START_TIMEOUT` for it
   * - opens the session there, then closes its tab (`close: "tab"`, by `title`) or the whole window (`"window"`)
   *   in window `from`
   * - `from` gone, or no `title` for a tab:  closes nothing
   */
  static async resume(handoff, title) {
    const { sessionId, to, from, close, remove } = handoff
    if (!SESSION_ID.test(sessionId ?? "")) throw new Error(`bad session id '${sessionId}'`)
    let window = Window.windowOf(to)
    if (!window) spawnSync("code", [to], { encoding: "utf8" })
    const deadline = Date.now() + WINDOW_START_TIMEOUT
    while (!window && Date.now() < deadline) {
      await new Promise((done) => setTimeout(done, 500))
      window = Window.windowOf(to)
    }
    if (!window) throw new Error(`${to} didn't open within ${WINDOW_START_TIMEOUT / 1000}s`)
    await Window.request("open-session", { sessionId }, window)
    const old = from ? Window.entries().get(Number(from)) : undefined
    let closed = false
    let matches
    if (old && close === "window") {
      await Window.request("close-window", {}, old)
      closed = true
    } else if (old && title) {
      ;({ closed, matches } = await Window.request("close-session-tab", { title }, old))
    }
    if (remove) rmSync(remove, { force: true })
    return { opened: true, closed, matches }
  }

  /** The package of `window` (a registry entry):  its workspace file's `packages/<pkg>/<pkg>.code-workspace`. */
  static packageOf(window) {
    return window?.workspaceFile?.match(/packages[\\/]([^\\/]+)[\\/]\1\.code-workspace$/)?.[1] ?? null
  }

  ////////////////
  // ## The window a session runs in
  ////////////////

  /** The registry folder:  `$SPELL_WINDOWS_DIR`, else `~/.spell/windows`.  Read on every call, for tests. */
  static get registry() {
    return process.env.SPELL_WINDOWS_DIR || join(homedir(), ".spell", "windows")
  }

  /** Every LIVE window's registry entry, by pid;  dead windows' files (a crash) are skipped, not deleted. */
  static entries() {
    const entries = new Map()
    const dir = Window.registry
    if (!existsSync(dir)) return entries
    for (const name of readdirSync(dir)) {
      if (!/^\d+\.json$/.test(name)) continue
      try {
        const entry = JSON.parse(readFileSync(join(dir, name), "utf8"))
        if (Number.isInteger(entry.pid) && isAlive(entry.pid)) entries.set(entry.pid, entry)
      } catch {
        // half-written or not ours:  skip it
      }
    }
    return entries
  }

  /**
   * The registry entry of the window this process runs in, or `null`.
   * - first:  the nearest ANCESTOR process with an entry (a session's window's extension host)
   * - else:  the window with `process.cwd()` inside one of its folders after the first (the first is the repo
   *   root, in every window);  the deepest such folder wins
   */
  static current() {
    const entries = Window.entries()
    if (!entries.size) return null
    const parents = parentPids()
    const seen = new Set()
    for (let pid = process.pid; pid > 1 && !seen.has(pid); pid = parents.get(pid) ?? 0) {
      if (entries.has(pid)) return entries.get(pid)
      seen.add(pid)
    }
    const cwd = real(process.cwd())
    let best = null
    let bestLength = -1
    for (const entry of entries.values()) {
      for (const folder of (entry.folders ?? []).slice(1).map(real)) {
        const inside = cwd === folder || cwd.startsWith(folder + sep)
        if (inside && folder.length > bestLength) [best, bestLength] = [entry, folder.length]
      }
    }
    return best
  }

  /**
   * Ask `window` (default:  ours) to run `op` with `body`;  resolves to its reply (`{ ok: true, ... }`).
   * - throws an `Error` saying what went wrong:  no window, no answer, or the op's own `error`
   */
  static async request(op, body = {}, window = Window.current()) {
    if (!window) {
      throw new Error("no window:  the spell extension's bridge isn't running in this session's VS Code window")
    }
    let response
    try {
      response = await fetch(`http://127.0.0.1:${window.port}/${op}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${window.token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      })
    } catch (error) {
      throw new Error(
        `window ${window.pid} didn't answer on port ${window.port} (${error.cause?.code ?? error.message})`
      )
    }
    const reply = await response.json().catch(() => ({}))
    if (!response.ok || !reply.ok) {
      throw new Error(`window ${window.pid} \`${op}\` failed:  ${reply.error ?? `http ${response.status}`}`)
    }
    return reply
  }

  /** `yarn window <argv>`:  run one command;  resolves to the exit code. */
  static async main(argv) {
    const { positional, flags } = parseArgs(argv)
    const [command, target] = positional
    if (command === "init") {
      const written = Window.init()
      console.log(written.length ? `wrote ${written.join(", ")}` : "every package has its window file")
      return 0
    }
    if (!COMMANDS.includes(command) || (command !== "which" && !target)) {
      console.error(USAGE)
      return 1
    }
    if (["open", "close", "handoff", "resume"].includes(command)) return Window.worktreeCommand(command, target, flags)
    const window = Window.current()
    if (!window) {
      console.error("no window:  the spell extension's bridge isn't running in this session's VS Code window")
      console.error("  (install it with `yarn vscode`, then reload the window)")
      return 1
    }
    if (command === "which") {
      console.log(`pid        ${window.pid}`)
      console.log(`workspace  ${window.workspaceFile ?? "(none:  not opened from a .code-workspace)"}`)
      console.log(`folders    ${window.folders.join("\n           ")}`)
      return 0
    }
    const path = resolve(target)
    try {
      if (command === "add") {
        const { added } = await Window.request("add-folder", flags.name ? { path, name: flags.name } : { path }, window)
        console.log(added ? `added ${path} to window ${window.pid}` : `${path} is already in window ${window.pid}`)
      } else if (command === "remove") {
        const { removed } = await Window.request("remove-folder", { path }, window)
        console.log(removed ? `removed ${path} from window ${window.pid}` : `${path} isn't in window ${window.pid}`)
      } else {
        await Window.request("show-doc", { file: path }, window)
        console.log(`showing ${path} in window ${window.pid}`)
      }
      return 0
    } catch (error) {
      console.error(error.message)
      return 1
    }
  }

  /**
   * `open` / `close` / `handoff` worktree `name`'s window, or `resume` a handoff;  resolves to the exit code.
   * - `resume`'s `name` is the handoff record's file:  read, then deleted
   */
  static async worktreeCommand(command, name, flags) {
    try {
      if (command === "handoff") {
        const handoff = Window.handoff(name, process.env.CLAUDE_CODE_SESSION_ID, { back: Boolean(flags.back) })
        if (!handoff) {
          const closed = await Window.close(name)
          console.log(`this session isn't in ${name}'s window, so stays put;  ${closed ? "closed" : "no"} window of ${name}`)
          return 0
        }
        console.log(`this session moves to ${relative(MAIN_ROOT, handoff.to)}'s window when this turn ends`)
        if (!handoff.from) console.log("  (this session's window not found:  its old tab stays open)")
        return 0
      }
      if (command === "resume") {
        const handoff = JSON.parse(readFileSync(name, "utf8"))
        rmSync(name, { force: true })
        const { closed, matches } = await Window.resume(handoff, flags.title)
        console.log(`${new Date().toISOString()}  opened session ${handoff.sessionId} in ${handoff.to}`)
        if (!closed) console.log(`  left its old ${handoff.close} open (${matches ?? "no"} tabs titled '${flags.title ?? ""}')`)
        return 0
      }
      if (command === "close") {
        const closed = await Window.close(name)
        console.log(closed ? `closed the window of ${name}` : `no window of ${name} open;  its file is gone`)
        return 0
      }
      const pkg = flags.pkg ?? Window.packageOf(Window.current())
      if (!pkg) throw new Error("which package?  --pkg <pkg> (this session's window isn't a package window)")
      console.log(`opened ${Window.open(name, pkg)}`)
      return 0
    } catch (error) {
      console.error(error.message)
      return 1
    }
  }
}

/** Every command. */
const COMMANDS = ["init", "which", "add", "remove", "show", "open", "close", "handoff", "resume"]

/** Usage, printed for a bad command. */
const USAGE = `usage:  yarn window <command>
  init                         write each package's missing packages/<pkg>/<pkg>.code-workspace
  which                        this session's VS Code window:  pid, workspace file, folders
  add <path> [--name <name>]   add a folder (a worktree) to the window
  remove <path>                remove it again
  show <file>                  show an .html doc in the window's Simple Browser
  open <name> [--pkg <pkg>]    open worktree <name> in a new window (default package:  this window's)
  close <name>                 close that window, delete its file
  handoff <name> [--back]      move this session to <name>'s window when this turn ends
                               (--back:  from it to its package's window, then close it)
  resume <record> [--title <title>]
                               the move itself (the Stop hook runs it)`

/** The package worktree window file `file` focuses on:  its second folder, `<name>/packages/<pkg>`. */
function worktreePackage(file) {
  const folder = JSON.parse(readFileSync(file, "utf8")).folders?.[1]?.path ?? ""
  const pkg = folder.match(/packages[\\/]([^\\/]+)$/)?.[1]
  if (!pkg) throw new Error(`${file}:  no package folder`)
  return pkg
}

/** Whether a process `pid` exists:  signal 0 checks without signalling;  EPERM means it exists, someone else's. */
function isAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error.code === "EPERM"
  }
}

/** The main checkout's root of `root`:  the part before `/.claude/worktrees/`, if `root` is a worktree. */
export function mainRoot(root) {
  return root.split(`${sep}.claude${sep}worktrees${sep}`)[0]
}

/**
 * Title-bar colours for worktree `name`:  a hue of its own (a hash of the name), dark enough for white text;
 * dimmer while the window isn't focused.
 */
export function tint(name) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  const hue = hash % 360
  return {
    "titleBar.activeBackground": hslHex(hue, 60, 32),
    "titleBar.inactiveBackground": hslHex(hue, 35, 24),
    "titleBar.activeForeground": "#ffffff",
    "titleBar.inactiveForeground": "#ffffffaa"
  }
}

/** HSL (degrees, percents) -> `#rrggbb`. */
function hslHex(hue, saturation, lightness) {
  const s = saturation / 100
  const l = lightness / 100
  const a = s * Math.min(l, 1 - l)
  return `#${channel(0)}${channel(8)}${channel(4)}`

  /** One channel, as two hex digits:  `n` 0 red, 8 green, 4 blue. */
  function channel(n) {
    const k = (n + hue / 30) % 12
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0")
  }
}

/** Every process's parent pid, by pid:  ONE `ps` call (empty if `ps` fails). */
function parentPids() {
  const parents = new Map()
  const run = spawnSync("ps", ["-axo", "pid=,ppid="], { encoding: "utf8" })
  if (run.status !== 0) return parents
  for (const line of run.stdout.split("\n")) {
    const [pid, ppid] = line.trim().split(/\s+/).map(Number)
    if (pid) parents.set(pid, ppid)
  }
  return parents
}

/** `path` with symlinks resolved (`/tmp` -> `/private/tmp`), as `process.cwd()` reports it;  as is if missing. */
function real(path) {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

/** `--key value` flags, plus everything else in order. */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(/^--([\w-]+)$/)
    if (!match) positional.push(argv[i])
    else flags[match[1]] = i + 1 < argv.length ? argv[++i] : true
  }
  return { positional, flags }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await Window.main(process.argv.slice(2))
}
