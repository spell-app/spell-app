#!/usr/bin/env node
/**
 * `yarn window <command>`:  the VS Code windows Owen works in, one per package.
 *
 * ## Window files
 * - `workspaces/<pkg>.code-workspace`:  open a package's window from it (`code workspaces/ui.code-workspace`).
 * - Its FIRST folder is the repo root, its second the package.  Why:  the Claude Code panel lists only the sessions
 *   saved under a window's first folder, so with the root first, every window lists every session.
 * - Its own colour theme, so windows are told apart at a glance (instead of VS Code profiles).
 * - The root folder hides `packages/` and `.claude/worktrees/`:  the package folder is the window's focus.
 * - A saved workspace can gain and lose folders (a worktree, while a session works in it) without restarting
 *   extensions;  a one-folder window can't, and its Claude panel restarts.
 *   - NEVER add one any more:  VS Code writes the folder into the window file, where it outlives the worktree,
 *     unseen:  the files are `skip-worktree` in the main checkout (so Owen's theme changes never show either)
 * - `git.detectWorktrees` on:  Source Control lists every worktree as its own repo, changes and diffs included,
 *   so a session that STAYS in its window when it isolates (below) is still reviewable there.
 *   - every package window lists every worktree;  takes a window reload
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
 * - `/isolate` and `/epic` open a worktree in a NEW window (`open <name>`).
 * - Then the session MOVES there (`handoff <name>`):  when its turn ends, the worktree's window opens it in an
 *   editor tab (never the sidebar), and the old window closes its tab.
 *   - So `/isolate` ends its turn RIGHT AFTER `handoff`, and does the rest (`yarn install` ...) in the new window.
 *   - `--prompt <text>`:  typed into the new tab's input, so Owen only presses enter to carry on.
 * - On leaving (`/isolate done`), it does NOT move back:  it stays in the worktree's window, which Owen closes
 *   (`close <name>` closes it and deletes its file).  `handoff <name> --back` still moves a session back to its
 *   package's window, but no skill uses it any more (Owen, 2026-10-03:  "just confusing things").
 *   - A session can't move processes:  the new tab RESUMES it (same session id), and closing the old tab ends the
 *     old `claude` process.  The resumed session goes back into its worktree by itself (Claude records
 *     `worktree-state` in the transcript).
 *   - Why wait for the turn to end:  until then the old process is still writing the transcript, and the new tab
 *     would load it half-written.  The repo's `Stop` hook (`.claude/hooks/handoff.mjs`) starts `resume`, detached,
 *     since closing the old tab kills the hook's own `claude`.
 *   - The old tab is found by its label, the session's title:  its `/rename` title (the prompt hook,
 *     `.claude/hooks/prompt-gate.mjs`, sets it on `/isolate <name>`), else Claude's own.  No single match (two
 *     sessions with one title):  it stays open, idle;  close it by hand.
 *   - Log:  `<registry>/handoffs/<session id>.log`.
 * - Docs shown while the move is pending (`show`, `yarn plan-doc open`) wait for it, then show in the window the
 *   session moved to:  the window it's leaving is about to close its tab.
 * - Its file:  `workspaces/ongoing/<name>.code-workspace` in the main checkout, beside the package windows' files;
 *   git ignores `workspaces/ongoing/`.
 * - Folders:  the MAIN repo root first, as in every window, so its Claude panel lists every session;  then the
 *   worktree's `packages/<pkg>` and the worktree's root (whose `packages/` is hidden, as the main root's is).
 * - The package window's theme, title bar tinted in a colour of the worktree's own (from its name):  told apart at a
 *   glance from the package window, and from other worktrees.
 *
 * ## Staying put
 * - Instead of moving, a session may STAY in its window:  same tab, only its folder is the worktree.  Owen picks,
 *   each time, in `/isolate`'s, `/epic`'s or `/unpark`'s modal;  `stay-check` recommends one and says why.
 * - Its changes show in Source Control (`git.detectWorktrees`), not in Explorer, and the title bar isn't tinted.
 * - Fine when it's the window's ONLY session.  Else the others share its doc preview (one doc at a time) and its
 *   Source Control, and a second worktree there is easy to mix up with the first.
 * - Later, it can still move:  `open <name>`, `handoff <name>`.
 *
 * ## Commands
 * - `init`:  write the window file of every package that lacks one;  never overwrites (themes are Owen's to change)
 * - `which`:  this session's window:  pid, workspace file, folders
 * - `add <path> [--name <name>]`:  add a folder (a worktree) to the window;  needs a window opened from its
 *   `.code-workspace` (else the change would restart its extensions, Claude panel included)
 * - `remove <path>`:  remove that folder again;  never the window's first
 * - `show <file>`:  show an `.html` doc in the window's doc preview (the right side bar's "Spell Docs" view);  in the window this session
 *   is moving to, once it has, while a `handoff` is pending
 * - `open <name> [--pkg <pkg>]`:  write worktree `<name>`'s window file and open it in a new window;  `<pkg>`
 *   defaults to this session's window's package.  `close <name>`:  close that window, delete the file.
 * - `handoff <name> [--back] [--prompt <text>]`:  move this session to worktree `<name>`'s window when its turn
 *   ends;  `--back`:  from it to its package's window, closing it after;  `--prompt`:  typed into the new tab.
 *   Needs `$CLAUDE_CODE_SESSION_ID` (Claude sets it in a session's commands).
 * - `resume <record> [--title <title>]...`:  the move itself, run by the `Stop` hook:  `<record>` the handoff's
 *   file (deleted once read), each `<title>` a label the session's tab may show, tried in order
 * - `stay-check [--epic] [--json]`:  should this session stay in its window when it isolates, or move?  Prints
 *   `recommend stay|window`, then a `- <reason>` line each
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

  /** `workspaces/<pkg>.code-workspace`. */
  static file(pkg) {
    return join(ROOT, "workspaces", `${pkg}.code-workspace`)
  }

  /** The window file's contents for `pkg`. */
  static workspace(pkg) {
    return {
      folders: [
        { path: "..", name: "spell-app" },
        { path: `../packages/${pkg}`, name: pkg }
      ],
      settings: {
        "workbench.colorTheme": THEMES[pkg] ?? FALLBACK_THEME,
        "git.detectWorktrees": true,
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

  /** `workspaces/ongoing/<name>.code-workspace`, in the main checkout. */
  static worktreeFile(name) {
    return join(MAIN_ROOT, "workspaces", "ongoing", `${name}.code-workspace`)
  }

  /**
   * The window file of worktree `name`, focused on `pkg`.
   * - folder paths are relative to `workspaces/ongoing/`
   */
  static worktreeWorkspace(pkg, name) {
    const worktree = `../../.claude/worktrees/${name}`
    return {
      folders: [
        { path: "../..", name: "spell-app" },
        { path: `${worktree}/packages/${pkg}`, name: `${pkg} ⎇ ${name}` },
        { path: worktree, name: `spell-app ⎇ ${name}` }
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
      const file = join(MAIN_ROOT, "workspaces", `${pkg}.code-workspace`)
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
    mkdirSync(dirname(file), { recursive: true })
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
   * - the record ~== `{ sessionId, to, from, close, remove, show, prompt }`:  `to` the target window's file, `from`
   *   this window's pid, `close` `"tab"` or `"window"`, `remove` a file to delete after, `show` a doc to show
   *   there, `{ file, hash }` (`Window.show()` sets it), `prompt` text typed into the new tab (or `null`)
   */
  static handoff(name, sessionId, { back = false, prompt = null } = {}) {
    if (!SESSION_ID.test(sessionId ?? "")) throw new Error("no session:  $CLAUDE_CODE_SESSION_ID isn't set")
    const file = Window.worktreeFile(name)
    if (!existsSync(file)) throw new Error(`no window file for ${name}:  \`open ${name}\` first`)
    const from = Window.current()
    let handoff = { sessionId, to: file, from: from?.pid ?? null, close: "tab", remove: null, show: null, prompt }
    if (back) {
      if (!from?.workspaceFile || real(from.workspaceFile) !== real(file)) return null
      const pkg = worktreePackage(file)
      const to = join(MAIN_ROOT, "workspaces", `${pkg}.code-workspace`)
      handoff = { sessionId, to, from: from.pid, close: "window", remove: file, show: null, prompt }
    }
    mkdirSync(Window.handoffs, { recursive: true, mode: 0o700 })
    writeFileSync(Window.handoffFile(sessionId), `${JSON.stringify(handoff, null, 2)}\n`, { mode: 0o600 })
    return handoff
  }

  /**
   * `resume`:  carry out `handoff` (a record), `titles` being the labels the session's tab may show (one string
   *   or several, in order);  returns what happened.
   * - opens window `to` (`code`, which just focuses it when open) and waits up to `WINDOW_START_TIMEOUT` for it
   * - opens the session there (its `prompt` typed in), then its `show` doc beside it, then closes its tab
   *   (`close: "tab"`, by `titles`) or the whole window (`"window"`) in window `from`
   * - `from` gone, or no title for a tab:  closes nothing;  `matches`:  how many tabs showed each title
   * - the doc failing to show never stops the move:  `shown` is `false` (no doc:  `undefined`)
   */
  static async resume(handoff, titles) {
    const { sessionId, to, from, close, remove, show, prompt } = handoff
    titles = [titles ?? []].flat().filter(Boolean)
    if (!SESSION_ID.test(sessionId ?? "")) throw new Error(`bad session id '${sessionId}'`)
    let window = Window.windowOf(to)
    if (!window) spawnSync("code", [to], { encoding: "utf8" })
    const deadline = Date.now() + WINDOW_START_TIMEOUT
    while (!window && Date.now() < deadline) {
      await new Promise((done) => setTimeout(done, 500))
      window = Window.windowOf(to)
    }
    if (!window) throw new Error(`${to} didn't open within ${WINDOW_START_TIMEOUT / 1000}s`)
    await Window.request("open-session", prompt ? { sessionId, prompt } : { sessionId }, window)
    let shown
    if (show) {
      shown = await Window.request("show-doc", show, window).then(
        () => true,
        () => false
      )
    }
    const old = from ? Window.entries().get(Number(from)) : undefined
    let closed = false
    let matches
    if (old && close === "window") {
      await Window.request("close-window", {}, old)
      closed = true
    } else if (old && titles.length) {
      ;({ closed, matches } = await Window.request("close-session-tab", { titles }, old))
    }
    if (remove) rmSync(remove, { force: true })
    return { opened: true, closed, matches, shown }
  }

  /**
   * Show `file` (an `.html` doc) in this session's window's doc preview, at id `hash` if given;  resolves to
   * `{ window }` (the registry entry it showed in) or `{ later }` (the window file it will show in).
   * - a `handoff` pending for `sessionId`:  NOT here, where the session's tab is about to close, but in the window
   *   it moves to, once it has (`resume`).  The preview shows one doc, so the last asked for wins.
   * - throws as `request()` does:  no window, or it failed
   */
  static async show(file, { hash, sessionId = process.env.CLAUDE_CODE_SESSION_ID } = {}) {
    const show = hash ? { file, hash } : { file }
    const pending = SESSION_ID.test(sessionId ?? "") ? Window.handoffFile(sessionId) : null
    if (pending && existsSync(pending)) {
      const handoff = { ...JSON.parse(readFileSync(pending, "utf8")), show }
      writeFileSync(pending, `${JSON.stringify(handoff, null, 2)}\n`, { mode: 0o600 })
      return { later: handoff.to }
    }
    const window = Window.current()
    await Window.request("show-doc", show, window)
    return { window }
  }

  /**
   * Whether this process runs in VS Code:  a session in the Claude Code extension, or anything in VS Code's
   * integrated terminal.
   * - NOT whether a VS Code window is open:  a CLI session in another terminal is "not in VS Code", even with the
   *   repo open in a window, so its docs go to the browser
   */
  static get inVSCode() {
    return process.env.CLAUDE_CODE_ENTRYPOINT === "claude-vscode" || process.env.TERM_PROGRAM === "vscode"
  }

  /** The package of `window` (a registry entry):  its workspace file's `workspaces/<pkg>.code-workspace`. */
  static packageOf(window) {
    return window?.workspaceFile?.match(/workspaces[\\/]([^\\/]+)\.code-workspace$/)?.[1] ?? null
  }

  ////////////////
  // ## Staying put
  ////////////////

  /**
   * `stay-check`:  the live facts for `stayAdvice()`, and its answer.
   * - `epic`:  for `/epic`, whose plan doc takes the window's doc preview
   */
  static stayCheck({ epic = false } = {}) {
    const window = Window.current()
    const processes = window ? processTable() : new Map()
    const sessions = window ? claudeSessions(processes, window.pid) : []
    const self = sessions.find((pid) => isAncestor(pid, process.pid, processes)) ?? null
    const others = sessions.filter((pid) => pid !== self)
    const cwds = cwdsOf(others)
    return stayAdvice({ window, others: others.map((pid) => ({ pid, cwd: cwds.get(pid) ?? null })), epic })
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
    if (!COMMANDS.includes(command) || (!["which", "stay-check"].includes(command) && !target)) {
      console.error(USAGE)
      return 1
    }
    if (command === "stay-check") {
      const advice = Window.stayCheck({ epic: Boolean(flags.epic) })
      if (flags.json) console.log(JSON.stringify(advice, null, 2))
      else console.log([`recommend ${advice.recommend}`, ...advice.reasons.map((reason) => `- ${reason}`)].join("\n"))
      return 0
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
        const { later } = await Window.show(path)
        console.log(
          later
            ? `${path} shows in ${relative(MAIN_ROOT, later)}'s window once this session moves there`
            : `showing ${path} in window ${window.pid}`
        )
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
        const prompt = typeof flags.prompt === "string" ? flags.prompt : null
        const handoff = Window.handoff(name, process.env.CLAUDE_CODE_SESSION_ID, { back: Boolean(flags.back), prompt })
        if (!handoff) {
          const closed = await Window.close(name)
          console.log(
            `this session isn't in ${name}'s window, so stays put;  ${closed ? "closed" : "no"} window of ${name}`
          )
          return 0
        }
        console.log(`this session moves to ${relative(MAIN_ROOT, handoff.to)}'s window when this turn ends`)
        if (!handoff.from) console.log("  (this session's window not found:  its old tab stays open)")
        return 0
      }
      if (command === "resume") {
        const handoff = JSON.parse(readFileSync(name, "utf8"))
        rmSync(name, { force: true })
        const { closed, matches, shown } = await Window.resume(handoff, flags.title)
        console.log(`${new Date().toISOString()}  opened session ${handoff.sessionId} in ${handoff.to}`)
        if (shown !== undefined) console.log(`  ${shown ? "showed" : "couldn't show"} ${handoff.show.file}`)
        if (!closed) console.log(`  left its old ${handoff.close} open (tabs per title:  ${JSON.stringify(matches ?? {})})`)
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
const COMMANDS = ["init", "which", "add", "remove", "show", "open", "close", "handoff", "resume", "stay-check"]

/** Usage, printed for a bad command. */
const USAGE = `usage:  yarn window <command>
  init                         write each package's missing workspaces/<pkg>.code-workspace
  which                        this session's VS Code window:  pid, workspace file, folders
  add <path> [--name <name>]   add a folder (a worktree) to the window
  remove <path>                remove it again
  show <file>                  show an .html doc in the window's doc preview (right side bar)
                               (moving:  in the window this session moves to)
  open <name> [--pkg <pkg>]    open worktree <name> in a new window (default package:  this window's)
  close <name>                 close that window, delete its file
  handoff <name> [--back] [--prompt <text>]
                               move this session to <name>'s window when this turn ends
                               (--back:  from it to its package's window, then close it;
                               --prompt:  typed into the new tab)
  resume <record> [--title <title>]...
                               the move itself (the Stop hook runs it)
  stay-check [--epic] [--json] stay in this window when isolating, or move?  recommend stay|window, and why`

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
  return new Map([...processTable()].map(([pid, { ppid }]) => [pid, ppid]))
}

/**
 * Every process, by pid:  `{ ppid, command }`, from ONE `ps` call, or from `text` (its output, for tests);  empty
 * if `ps` fails.
 * - `command`:  the executable's path, spaces and all
 */
export function processTable(text) {
  const processes = new Map()
  if (text === undefined) {
    const run = spawnSync("ps", ["-axo", "pid=,ppid=,comm="], { encoding: "utf8" })
    if (run.status !== 0) return processes
    text = run.stdout
  }
  for (const line of text.split("\n")) {
    const match = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line)
    if (match) processes.set(Number(match[1]), { ppid: Number(match[2]), command: match[3].trim() })
  }
  return processes
}

/**
 * The pids of the Claude Code sessions in the window whose extension host is `hostPid`:  its `claude` children.
 * - one per session, in a tab or the side bar.  NOT a `claude` in the window's terminal:  that's a child of the
 *   pty host.
 */
export function claudeSessions(processes, hostPid) {
  return [...processes]
    .filter(([, { ppid, command }]) => ppid === hostPid && /(^|\/)claude$/.test(command))
    .map(([pid]) => pid)
}

/** Whether `ancestor` is `pid` or one of its ancestors in `processes`. */
function isAncestor(ancestor, pid, processes) {
  const seen = new Set()
  for (; pid > 1 && !seen.has(pid); pid = processes.get(pid)?.ppid ?? 0) {
    if (pid === ancestor) return true
    seen.add(pid)
  }
  return false
}

/** Each of `pids`' working folder, by pid:  ONE `lsof` call;  missing when `lsof` can't tell. */
function cwdsOf(pids) {
  if (!pids.length) return new Map()
  const run = spawnSync("lsof", ["-a", "-d", "cwd", "-p", pids.join(","), "-Fpn"], { encoding: "utf8" })
  return parseLsof(run.stdout ?? "")
}

/**
 * `lsof -Fpn` output -> each pid's file, by pid:  `p<pid>` starts a process, `n<path>` is its file.
 * - other lines (`fcwd` ...) skipped
 */
export function parseLsof(text) {
  const cwds = new Map()
  let pid = 0
  for (const line of text.split("\n")) {
    if (line.startsWith("p")) pid = Number(line.slice(1))
    else if (line.startsWith("n") && pid) cwds.set(pid, line.slice(1))
  }
  return cwds
}

/** The worktree `cwd` is in (`.../.claude/worktrees/<name>/...`), else `null`. */
export function worktreeOf(cwd) {
  const marker = `${sep}.claude${sep}worktrees${sep}`
  const at = (cwd ?? "").indexOf(marker)
  return at < 0 ? null : cwd.slice(at + marker.length).split(sep)[0] || null
}

/**
 * Should a session isolating itself STAY in its window, or move to a worktree's window of its own?
 * - `window`:  its registry entry (`null`:  no bridge here)
 * - `others`:  the window's OTHER sessions, `{ pid, cwd }` each (`cwd` `null` when unknown)
 * - `epic`:  for `/epic`:  its plan doc takes the window's doc preview
 * - returns `{ recommend, others, reasons }`:  `recommend` `"stay"` or `"window"`;  `others` `{ pid, worktree }`
 *   each (`worktree` `null`:  in the main checkout);  `reasons` sentences for the modal
 */
export function stayAdvice({ window, others = [], epic = false }) {
  const listed = others.map(({ pid, cwd }) => ({ pid, worktree: worktreeOf(cwd) }))
  if (!window) {
    const reasons = ["no window bridge in this session's window:  a new window can't be opened from here anyway"]
    return { recommend: "stay", others: listed, reasons }
  }
  if (!listed.length) {
    const reasons = ["this session is the window's only one:  staying touches nothing else"]
    if (epic) reasons.push("the plan doc shows in this window's side bar")
    return { recommend: "stay", others: listed, reasons }
  }
  const where = listed.map(({ worktree }) => (worktree ? `worktree \`${worktree}\`` : "the main checkout"))
  const reasons = [
    `${listed.length > 1 ? `${listed.length} other sessions share` : "another session shares"} this window ` +
      `(${where.join(", ")})`
  ]
  const worktrees = listed.filter(({ worktree }) => worktree)
  if (worktrees.length) {
    reasons.push("another worktree's changes are already in this window's Source Control:  easy to mix the two up")
  }
  reasons.push(
    epic
      ? "the side bar's doc preview shows one doc:  the plan doc and the other sessions' docs would replace each other"
      : "they share its doc preview (one doc at a time)"
  )
  return { recommend: "window", others: listed, reasons }
}

/** `path` with symlinks resolved (`/tmp` -> `/private/tmp`), as `process.cwd()` reports it;  as is if missing. */
function real(path) {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

/**
 * `--key value` flags, plus everything else in order.
 * - a flag given twice is an array (`--title a --title b`)
 * - NOTE:  a value can't start with `--`
 */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(/^--([\w-]+)$/)
    if (!match) {
      positional.push(argv[i])
      continue
    }
    // a bare flag (`--back`) before another flag takes no value
    const value = i + 1 < argv.length && !argv[i + 1].startsWith("--") ? argv[++i] : true
    const key = match[1]
    flags[key] = key in flags ? [flags[key], value].flat() : value
  }
  return { positional, flags }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await Window.main(process.argv.slice(2))
}
