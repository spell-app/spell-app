#!/usr/bin/env node
/**
 * `spell dev window <command>`:  the VS Code windows Owen works in, one per package.
 *
 * ## Window files
 * - `workspaces/<pkg>.code-workspace`:  open a package's window from it (`code workspaces/ui.code-workspace`).
 * - Its FIRST folder is the repo root, the whole branch;  then the shared content repo.  Why the root first:  the
 *   Claude Code panel lists only the sessions saved under a window's first folder, so every window lists every
 *   session.  No package folder since 2026-10-06 (Owen:  "just check out the full branch").
 * - Its own colour theme, so windows are told apart at a glance (instead of VS Code profiles).
 * - Each file shows ONCE in Explorer and Quick Open (`filesExclude()`):  `.claude/worktrees/` hidden, and the shared
 *   links shown only under the `spell-app-dev` folder.  Generated files, icons and screenshots stay out of Quick
 *   Open and Find through the root's `.vscode/settings.json` (`search.exclude`).
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
 * - Docs shown while the move is pending (`show`, `spell dev plan-doc open`) wait for it, then show in the window the
 *   session moved to:  the window it's leaving is about to close its tab.
 * - Its file:  `workspaces/ongoing/<name>.code-workspace` in the main checkout, beside the package windows' files;
 *   git ignores `workspaces/ongoing/`.
 * - Folders:  the MAIN repo root first, as in every window, so its Claude panel lists every session;  then the
 *   worktree's root, `⎇ <name>`.  No package folder:  Owen (2026-10-03).
 *   - the main root's files are hidden (`files.exclude` `*` beside its `.spell-main` marker):  the worktree's
 *     folder has the same ones.  The main root stays first for the Claude panel, and keeps its Source Control.
 *   - the package it's for (theme, `handoff --back`'s target) is kept in the file's own `spell.package`
 * - Its look (epic `windows-and-review` P5):  `open <name> --color <look>` (`/epic <name> -<look>`), else the look of
 *   the window it's opened from;  a window file from before (or a window without one):  the package window's theme,
 *   the title bar tinted the worktree's own colour (`tint()`).
 *
 * ## Looks
 * - A LOOK is the whole window in Tomorrow Night Blue's colours, its blues turned to another hue (`LOOKS`:  red,
 *   orange, amber, green, teal, cyan, blue, indigo, purple, pink, brown, grey):  `workbench.colorTheme` set to it,
 *   the re-hued colours scoped to it in `workbench.colorCustomizations`;  the rest of Owen's own colours stay.
 * - `color <look>` (`/epic color <look>`) gives the window this session runs in a look:  written into its window
 *   file, which VS Code applies at once, with no reload and its extensions (the Claude panel) untouched (tested on a
 *   throwaway window:  Q11 of `windows-and-review`).  Only a window opened from a `.code-workspace` file.
 *
 * ## Staying put
 * - Instead of moving, a session may STAY in its window:  same tab, only its folder is the worktree.  Owen picks,
 *   each time, in `/isolate`'s, `/epic`'s or `/unpark`'s modal;  `stay-check` recommends one and says why.
 * - Its changes show in Source Control (`git.detectWorktrees`), not in Explorer.
 * - The window says so at once (`stay <name>`, epic `windows-and-review` P5):  titled `⎇ <name>`, its title bar
 *   tinted the worktree's colour;  what that replaced is kept in the file's `spell.stay`, and `stay --end`
 *   (`/isolate done`) puts it back.  Before, the window kept its old title (`docs-sidebar` while the session worked
 *   in `quick-open`).
 * - Fine when it's the window's ONLY session.  Else the others share its doc preview (one doc at a time) and its
 *   Source Control, and a second worktree there is easy to mix up with the first.
 * - Later, it can still move:  `open <name>`, `handoff <name>`.
 *
 * ## Commands
 * - `init`:  write the window file of every package that lacks one, and bring the others up to date:  folders and
 *   `files.exclude` (a worktree's window:  `files.exclude`);  themes and other settings are Owen's, kept
 * - `which`:  this session's window:  pid, workspace file, folders
 * - `add <path> [--name <name>]`:  add a folder (a worktree) to the window;  needs a window opened from its
 *   `.code-workspace` (else the change would restart its extensions, Claude panel included)
 * - `remove <path>`:  remove that folder again;  never the window's first
 * - `show <file> [--hash <id>] [--review]`:  show an `.html` doc in the window's doc preview (the right side bar's
 *   "Spell Docs" tab;  `--review`:  its "Review" tab), at id `<id>`;  in the window this session is moving to, once
 *   it has, while a `handoff` is pending
 * - `open <name> [--pkg <pkg>] [--color <look>]`:  write worktree `<name>`'s window file and open it in a new
 *   window;  `<pkg>` (a package, or any `workspaces/<pkg>.code-workspace`) defaults to this session's window's
 *   package, else `spell-app` (the whole repo's window);  its look:  `--pkg`'s window's when named, else this
 *   session's window's.  `close <name>`:  close that window, delete the file.
 * - `launch <name> [--pkg <pkg>] [--color <look>] [--prompt <text>]`:  make worktree `<name>` if needed, `open` it
 *   (`<pkg>` default `spell-app`;  its look `--color`'s, else `<pkg>`'s, tinted:  never this window's), and start a
 *   NEW Claude Code session in it, `<text>` typed in (default `/epic <name>`).  This session stays where it is:
 *   `/epic <name>` typed in another epic's session (the `/epic` skill's "From another worktree")
 * - `handoff <name> [--back] [--prompt <text>]`:  move this session to worktree `<name>`'s window when its turn
 *   ends;  `--back`:  from it to its package's window, closing it after;  `--prompt`:  typed into the new tab.
 *   Needs `$CLAUDE_CODE_SESSION_ID` (Claude sets it in a session's commands).
 * - `resume <record> [--title <title>]...`:  the move itself, run by the `Stop` hook:  `<record>` the handoff's
 *   file (deleted once read), each `<title>` a label the session's tab may show, tried in order
 * - `color [<look>]`:  give this session's window a look (`LOOKS`);  no look:  list them
 * - `stay <name>` / `stay --end`:  title and tint this session's window for worktree `<name>` it stays in / put back
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

/** `open`'s window file when this session's window isn't a package's:  `workspaces/spell-app.code-workspace`. */
const DEFAULT_WINDOW = "spell-app"

/** The MAIN checkout's marker file (git-ignored):  worktree windows hide what's beside it (`filesExclude()`). */
const MAIN_MARKER = ".spell-main"

/** The shared links when the manifest has none:  root `package.json` `"shared": { "links" }`. */
const SHARED_LINKS = ["epics", "guides", "pages", "templates", "brand", "ui", "goals", "agents"]

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

  /**
   * The window file's contents for `pkg`:  the WHOLE branch (the repo root), then the shared content repo.
   * - one file per package still, each with its own theme;  no package folder any more (Owen, 2026-10-06:  "just
   *   check out the full branch")
   */
  static workspace(pkg) {
    return {
      folders: Window.packageFolders(),
      settings: {
        "workbench.colorTheme": THEMES[pkg] ?? FALLBACK_THEME,
        "git.detectWorktrees": true,
        "files.exclude": Window.filesExclude()
      }
    }
  }

  /** A package window's folders, relative to `workspaces/`:  the repo root, then the shared content repo. */
  static packageFolders() {
    return [{ path: "..", name: "spell-app" }, ...Window.sharedFolder(join(ROOT, "workspaces"))]
  }

  /**
   * A window's `files.exclude`, so Explorer and Quick Open show each file ONCE.  It applies to every folder of the
   * window, each pattern relative to the folder;  a `when` hides an entry only beside a sibling of that name.
   * - `.claude/worktrees`:  a worktree is its own folder (a worktree window), or its own repo in Source Control
   * - the shared links (`epics`, `guides` ...) in a CHECKOUT (beside its `package.json`):  their files show once,
   *   under the `spell-app-dev` folder, at the real path edits need (root `AGENTS.md`, "Shared content")
   * - `worktree`:  also everything in the MAIN checkout's folder (beside its `.spell-main` marker,
   *   `ensureMainMarker()`):  the worktree's folder has the same files.  The main root stays the first folder, for
   *   the Claude panel, and keeps its Source Control.
   */
  static filesExclude({ worktree = false } = {}) {
    return {
      ".claude/worktrees": true,
      ...(worktree && { "*": { when: MAIN_MARKER } }),
      ...Object.fromEntries(sharedLinks().map((link) => [link, { when: "package.json" }]))
    }
  }

  /** Write the MAIN checkout's `.spell-main` marker if it's missing (git-ignored):  see `filesExclude()`. */
  static ensureMainMarker() {
    const marker = join(MAIN_ROOT, MAIN_MARKER)
    if (existsSync(marker)) return
    writeFileSync(
      marker,
      "The MAIN checkout's marker:  worktree windows hide this folder's files (`files.exclude`, scripts/window.mjs\n" +
        "`filesExclude()`), so Quick Open and Explorer show each file once, from the worktree.  Never in a worktree.\n"
    )
  }

  /**
   * `init`:  write the missing window files, and bring existing ones up to date;  returns the paths written.
   * - a package window:  its folders (`packageFolders()`) and `files.exclude`;  its theme and every other setting
   *   are Owen's, kept
   * - a worktree's window (`workspaces/ongoing/`):  its `files.exclude`
   * - an existing file VS Code can't read as JSON (comments) is left alone
   * - NOTE:  a package window that changes folders while open re-reads its workspace;  its Claude panel may reload
   */
  static init() {
    Window.ensureMainMarker()
    const written = []
    for (const pkg of Window.packages) {
      const file = Window.file(pkg)
      if (!existsSync(file)) {
        writeFileSync(file, `${JSON.stringify(Window.workspace(pkg), null, 2)}\n`)
        written.push(relative(ROOT, file))
        continue
      }
      const refreshed = refresh(file, (workspace) => {
        workspace.folders = Window.packageFolders()
        workspace.settings = { ...workspace.settings, "files.exclude": Window.filesExclude() }
      })
      if (refreshed) written.push(relative(ROOT, file))
    }
    const ongoing = join(MAIN_ROOT, "workspaces", "ongoing")
    for (const name of existsSync(ongoing) ? readdirSync(ongoing) : []) {
      if (!name.endsWith(".code-workspace")) continue
      const file = join(ongoing, name)
      const refreshed = refresh(file, (workspace) => {
        workspace.settings = { ...workspace.settings, "files.exclude": Window.filesExclude({ worktree: true }) }
      })
      if (refreshed) written.push(relative(MAIN_ROOT, file))
    }
    return written
  }

  /**
   * The shared content repo (epic `shared-content`) as a window folder, `[{ path, name }]` with `path` relative to
   * `fromDir` (where the window file is);  `[]` when it doesn't exist.
   * - its own Source Control entry (the auto commits) and search;  permanent, so unlike a worktree it belongs in
   *   every window.  Its own `.vscode/settings.json` hides its `packages/` (the old-path links)
   * - where:  `"shared": { "dir" }` in the main checkout's `package.json`, else `../spell-app-dev`
   */
  static sharedFolder(fromDir) {
    let dir = "../spell-app-dev"
    try {
      dir = JSON.parse(readFileSync(join(MAIN_ROOT, "package.json"), "utf8")).shared?.dir ?? dir
    } catch {
      // no manifest:  the default
    }
    const shared = resolve(MAIN_ROOT, dir)
    return existsSync(shared) ? [{ path: relative(fromDir, shared), name: "spell-app-dev" }] : []
  }

  ////////////////
  // ## A worktree's window
  ////////////////

  /** `workspaces/ongoing/<name>.code-workspace`, in the main checkout. */
  static worktreeFile(name) {
    return join(MAIN_ROOT, "workspaces", "ongoing", `${name}.code-workspace`)
  }

  /**
   * The window file of worktree `name`, opened from `pkg`'s window.
   * - folder paths are relative to `workspaces/ongoing/`
   * - `spell.package`:  `pkg`, for `handoff --back`;  VS Code ignores a top-level key it doesn't know
   * - hides the main root's files (`filesExclude({ worktree: true })`):  the worktree's folder has the same ones
   * - its look (epic `windows-and-review` P5, Q1):  `color`, a look's name (`LOOKS`);  else `from`'s, the window
   *   file of the window it's opened from (its theme and colours, a staying session's tint left out);  else `pkg`'s
   *   theme, the title bar tinted the worktree's own colour (`tint()`)
   */
  static worktreeWorkspace(pkg, name, { color = null, from = null } = {}) {
    const settings = {
      "workbench.colorTheme": Window.theme(pkg),
      "files.exclude": Window.filesExclude({ worktree: true })
    }
    if (color) withLook(settings, color)
    else if (from?.settings?.["workbench.colorTheme"]) {
      const source = JSON.parse(JSON.stringify(from))
      withoutStay(source)
      settings["workbench.colorTheme"] = source.settings["workbench.colorTheme"]
      if (source.settings["workbench.colorCustomizations"])
        settings["workbench.colorCustomizations"] = source.settings["workbench.colorCustomizations"]
    } else settings["workbench.colorCustomizations"] = tint(name)
    return {
      folders: [
        { path: "../..", name: "spell-app" },
        { path: `../../.claude/worktrees/${name}`, name: `⎇ ${name}` },
        ...Window.sharedFolder(join(MAIN_ROOT, "workspaces", "ongoing"))
      ],
      settings,
      spell: { package: pkg }
    }
  }

  /**
   * Change the window file of the window this session runs in:  `change(workspace)` edits it in place (`refresh()`).
   * VS Code takes a settings change at once:  no reload, its extensions (the Claude panel) untouched (Q11 of
   * `windows-and-review`, tested on a throwaway window).  Returns `{ file, written }`;  throws without a window file.
   */
  static editCurrent(change) {
    const file = Window.current()?.workspaceFile
    if (!file) throw new Error("this window wasn't opened from a .code-workspace file:  nothing to write its look into")
    return { file, written: refresh(file, change) }
  }

  /** `color <look>`:  give this session's window look `name` (`LOOKS`);  returns its file. */
  static color(name) {
    look(name)
    return Window.editCurrent((workspace) => withLook((workspace.settings ??= {}), name)).file
  }

  /** `stay <name>` / `stay --end`:  retitle and tint this session's window for worktree `name` / put it back. */
  static stay(name, { end = false } = {}) {
    let changed = false
    const { file } = Window.editCurrent((workspace) => {
      changed = end ? withoutStay(workspace) : Boolean(withStay(workspace, name))
    })
    return { file, changed }
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
   * `open`:  (re)write worktree `name`'s window file and open it with `code`;  returns `{ file, colors }`.
   * - already open:  VS Code focuses that window
   * - its colours (`workbench.colorCustomizations`) are NOT in the file yet:  a window starting up draws the theme's
   *   colours VS Code cached from the last window that had them, and only a CHANGE to the setting makes it read them
   *   (P5 of `windows-and-review`:  a probe opened green came up in an older probe's purple).  `colors` go in once
   *   the window is up (`applyColors()`), a live change
   */
  static open(name, pkg, { color = null, fromCurrent = true } = {}) {
    if (!existsSync(join(MAIN_ROOT, ".claude", "worktrees", name))) throw new Error(`no worktree ${name}`)
    // a package, or any other window file (`spell-app`:  the whole repo's)
    if (!Window.packages.includes(pkg) && !existsSync(join(MAIN_ROOT, "workspaces", `${pkg}.code-workspace`)))
      throw new Error(`no package ${pkg}`)
    if (color) look(color)
    const file = Window.worktreeFile(name)
    mkdirSync(dirname(file), { recursive: true })
    Window.ensureMainMarker()
    const from = fromCurrent ? Window.currentWorkspace() : null
    const workspace = Window.worktreeWorkspace(pkg, name, { color, from })
    const colors = workspace.settings["workbench.colorCustomizations"] ?? null
    delete workspace.settings["workbench.colorCustomizations"]
    writeFileSync(file, `${JSON.stringify(workspace, null, 2)}\n`)
    const run = spawnSync("code", [file], { encoding: "utf8" })
    if (run.status !== 0) throw new Error(`\`code ${file}\` failed:  ${run.stderr || run.error?.message}`)
    return { file, colors }
  }

  /**
   * Write `colors` into window file `file` once its window is up (its registry entry, `WINDOW_START_TIMEOUT` at
   * most, then a moment for its settings to load):  a live change, which the window applies (`open()`).  Resolves
   * to whether the window was seen;  the colours are written either way.
   */
  static async applyColors(file, colors, { wait = 1500 } = {}) {
    const deadline = Date.now() + WINDOW_START_TIMEOUT
    let seen = false
    while (!(seen = Boolean(Window.windowOf(file))) && Date.now() < deadline) await delay(500)
    if (seen) await delay(wait)
    refresh(file, (workspace) => {
      workspace.settings ??= {}
      workspace.settings["workbench.colorCustomizations"] = colors
    })
    return seen
  }

  /** The window file of the window this session runs in, parsed;  `null` when there's none (or it's JSONC). */
  static currentWorkspace() {
    try {
      const file = Window.current()?.workspaceFile
      return file ? JSON.parse(readFileSync(file, "utf8")) : null
    } catch {
      return null
    }
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

  /**
   * `launch`:  make worktree `name` if needed (the `WorktreeCreate` hook's own `create`, from the MAIN checkout), open
   * its window, and start a NEW Claude Code session there, `prompt` typed in (not sent);  resolves to `{ file }`.
   * - for `/epic <name>` typed in ANOTHER epic's session (Owen, 2026-10-07):  that session stays where it is
   * - its look:  `color`, else `pkg`'s window's theme, the title bar tinted `name`'s own colour;  never the look of
   *   the window it's launched from, another epic's
   */
  static async launch(name, pkg, { color = null, prompt = null } = {}) {
    const hook = join(MAIN_ROOT, ".claude", "hooks", "worktree.mjs")
    const input = JSON.stringify({ name, cwd: MAIN_ROOT })
    const made = spawnSync(process.execPath, [hook, "create"], { input, encoding: "utf8" })
    if (made.status !== 0) throw new Error(`worktree ${name} not made:  ${made.stderr.trim()}`)
    const { file, colors } = Window.open(name, pkg, { color, fromCurrent: false })
    const window = await Window.waitFor(file)
    if (colors) await Window.applyColors(file, colors)
    await Window.request("open-session", prompt ? { prompt } : {}, window)
    return { file }
  }

  /** The registry entry of the window opened from `file`, once it's up;  throws after `WINDOW_START_TIMEOUT`. */
  static async waitFor(file) {
    const deadline = Date.now() + WINDOW_START_TIMEOUT
    let window = Window.windowOf(file)
    while (!window && Date.now() < deadline) {
      await delay(500)
      window = Window.windowOf(file)
    }
    if (!window) throw new Error(`${file} didn't open within ${WINDOW_START_TIMEOUT / 1000}s`)
    return window
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
   *   there, `{ file, hash?, view? }` (`Window.show()` sets it), `prompt` text typed into the new tab (or `null`)
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
    if (!Window.windowOf(to)) spawnSync("code", [to], { encoding: "utf8" })
    const window = await Window.waitFor(to)
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
   * - `view`:  the side bar tab, `"docs"` ("Spell Docs", the default) or `"review"` ("Review");  sent only when
   *   given, so an extension from before the tabs still shows the doc
   * - a `handoff` pending for `sessionId`:  NOT here, where the session's tab is about to close, but in the window
   *   it moves to, once it has (`resume`).  The handoff keeps ONE doc, so the last asked for wins, whichever tab.
   * - throws as `request()` does:  no window, or it failed
   */
  static async show(file, { hash, view, sessionId = process.env.CLAUDE_CODE_SESSION_ID } = {}) {
    const show = { file, ...(hash && { hash }), ...(view && { view }) }
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

  /** `spell dev window <argv>`:  run one command;  resolves to the exit code. */
  static async main(argv) {
    const { positional, flags } = parseArgs(argv)
    const [command, target] = positional
    if (command === "init") {
      const written = Window.init()
      console.log(written.length ? `wrote ${written.join(", ")}` : "every window file is up to date")
      return 0
    }
    const bare = ["which", "stay-check", "reload-view", "color"].includes(command) || (command === "stay" && flags.end)
    if (!COMMANDS.includes(command) || (!bare && !target)) {
      console.error(USAGE)
      return 1
    }
    if (command === "color" || command === "stay") return Window.lookCommand(command, target, flags)
    if (command === "stay-check") {
      const advice = Window.stayCheck({ epic: Boolean(flags.epic) })
      if (flags.json) console.log(JSON.stringify(advice, null, 2))
      else console.log([`recommend ${advice.recommend}`, ...advice.reasons.map((reason) => `- ${reason}`)].join("\n"))
      return 0
    }
    if (["open", "launch", "close", "handoff", "resume"].includes(command)) return Window.worktreeCommand(command, target, flags)
    const window = Window.current()
    if (!window) {
      console.error("no window:  the spell extension's bridge isn't running in this session's VS Code window")
      console.error("  (install it with `spell dev vscode`, then reload the window)")
      return 1
    }
    if (command === "which") {
      console.log(`pid        ${window.pid}`)
      console.log(`workspace  ${window.workspaceFile ?? "(none:  not opened from a .code-workspace)"}`)
      console.log(`folders    ${window.folders.join("\n           ")}`)
      return 0
    }
    if (command === "reload-view") {
      const view = flags.review ? "review" : "docs"
      try {
        const { url } = await Window.request("reload-view", { view }, window)
        console.log(
          url ? `rebuilt the ${view} view at ${url}` : `the ${view} view hasn't been shown yet:  nothing to rebuild`
        )
        return 0
      } catch (error) {
        console.error(error.message)
        if (/unknown op/.test(error.message))
          console.error("  (this window's spell extension predates `reload-view`:  `spell dev vscode`, then reload it)")
        return 1
      }
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
        const hash = typeof flags.hash === "string" ? flags.hash : undefined
        const { later } = await Window.show(path, { hash, view: flags.review ? "review" : undefined })
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
   * `color [<look>]` / `stay <name> | --end`:  this session's window's look and title;  returns the exit code.
   * - `color` alone lists the looks
   */
  static lookCommand(command, target, flags) {
    try {
      if (command === "color" && !target) {
        console.log(`looks:  ${Object.keys(LOOKS).join(", ")}  (Tomorrow Night Blue's look, in that hue)`)
        return 0
      }
      if (command === "color") {
        console.log(`${relative(MAIN_ROOT, Window.color(target))}:  look ${target.toLowerCase()}`)
        return 0
      }
      const { file, changed } = Window.stay(target, { end: Boolean(flags.end) })
      const what = flags.end
        ? changed
          ? "title and title bar put back"
          : "wasn't retitled:  nothing to put back"
        : `titled ⎇ ${target}`
      console.log(`${relative(MAIN_ROOT, file)}:  ${what}`)
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
        if (!closed)
          console.log(`  left its old ${handoff.close} open (tabs per title:  ${JSON.stringify(matches ?? {})})`)
        return 0
      }
      if (command === "launch") {
        const pkg = flags.pkg ?? DEFAULT_WINDOW
        const color = typeof flags.color === "string" ? flags.color : null
        const prompt = typeof flags.prompt === "string" ? flags.prompt : `/epic ${name}`
        const { file } = await Window.launch(name, pkg, { color, prompt })
        console.log(`opened ${relative(MAIN_ROOT, file)}, a new session there:  ${prompt}`)
        return 0
      }
      if (command === "close") {
        const closed = await Window.close(name)
        console.log(closed ? `closed the window of ${name}` : `no window of ${name} open;  its file is gone`)
        return 0
      }
      // not a package window (a worktree's ...):  the whole repo's window, never a question (Owen, 2026-10-07)
      const pkg = flags.pkg ?? Window.packageOf(Window.current()) ?? DEFAULT_WINDOW
      const color = typeof flags.color === "string" ? flags.color : null
      // `--pkg` named:  that window's look, not this one's
      const { file, colors } = Window.open(name, pkg, { color, fromCurrent: !flags.pkg })
      console.log(`opened ${file}`)
      if (colors && !(await Window.applyColors(file, colors)))
        console.log("  (its window didn't show up in time:  colours written anyway;  a change to them applies them)")
      return 0
    } catch (error) {
      console.error(error.message)
      return 1
    }
  }
}

/** Every command. */
const COMMANDS = [
  "init",
  "which",
  "add",
  "remove",
  "show",
  "reload-view",
  "open",
  "launch",
  "close",
  "handoff",
  "resume",
  "stay-check",
  "color",
  "stay"
]

/** Usage, printed for a bad command. */
const USAGE = `usage:  spell dev window <command>
  init                         write each package's missing workspaces/<pkg>.code-workspace, and bring
                               every window file up to date (folders, files.exclude;  theme kept)
  which                        this session's VS Code window:  pid, workspace file, folders
  add <path> [--name <name>]   add a folder (a worktree) to the window
  remove <path>                remove it again
  show <file> [--hash <id>] [--review]
                               show an .html doc in the window's doc preview (right side bar's
                               "Spell Docs" tab;  --review:  its "Review" tab), at id <id>
                               (moving:  in the window this session moves to)
  reload-view [--review]       rebuild the "Spell Docs" view (--review:  "Review") from scratch, a new
                               frame at the page it shows:  for a view gone wrong (clicks lost ...)
  open <name> [--pkg <pkg>] [--color <look>]
                               open worktree <name> in a new window (default package:  this window's;
                               default look:  this window's)
  launch <name> [--pkg <pkg>] [--color <look>] [--prompt <text>]
                               make worktree <name> if needed, open its window, and start a NEW session
                               there, <text> typed in (default:  /epic <name>);  this session stays put
  color [<look>]               give this window a look:  Tomorrow Night Blue's, in a hue (no look:  list them)
  stay <name> | --end          a session staying here for worktree <name>:  title the window ⎇ <name>, tint its
                               title bar  /  put both back
  close <name>                 close that window, delete its file
  handoff <name> [--back] [--prompt <text>]
                               move this session to <name>'s window when this turn ends
                               (--back:  from it to its package's window, then close it;
                               --prompt:  typed into the new tab)
  resume <record> [--title <title>]...
                               the move itself (the Stop hook runs it)
  stay-check [--epic] [--json] stay in this window when isolating, or move?  recommend stay|window, and why`

/**
 * The package worktree window file `file` was opened from:  its `spell.package`.
 * - an older file (before 2026-10-03) has none:  its second folder, `<name>/packages/<pkg>`
 */
function worktreePackage(file) {
  const workspace = JSON.parse(readFileSync(file, "utf8"))
  const folder = workspace.folders?.[1]?.path ?? ""
  const pkg = workspace.spell?.package ?? folder.match(/packages[\\/]([^\\/]+)$/)?.[1]
  if (!pkg) throw new Error(`${file}:  no package`)
  return pkg
}

/** The shared links' names:  the main checkout's `package.json` `"shared": { "links" }`, else `SHARED_LINKS`. */
function sharedLinks() {
  try {
    return JSON.parse(readFileSync(join(MAIN_ROOT, "package.json"), "utf8")).shared?.links ?? SHARED_LINKS
  } catch {
    return SHARED_LINKS
  }
}

/**
 * Bring window file `file` up to date:  `change(workspace)` edits it in place;  written back only when that
 * changed something.  Returns whether it was written.
 * - JSONC (comments):  VS Code reads it, we don't;  left alone, `false`
 */
function refresh(file, change) {
  let text
  let workspace
  try {
    text = readFileSync(file, "utf8")
    workspace = JSON.parse(text)
  } catch {
    return false
  }
  change(workspace)
  const fresh = `${JSON.stringify(workspace, null, 2)}\n`
  if (fresh === text) return false
  writeFileSync(file, fresh)
  return true
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

/**
 * The named LOOKS a window can take (epic `windows-and-review` P5, Q1:  Owen, 2026-10-06):  the WHOLE window in
 * Tomorrow Night Blue's look, its blues turned to the look's hue.  `hue` in degrees;  `saturation`:  how much of the
 * theme's colour it keeps (1, all).  `blue` is the theme itself.
 */
export const LOOKS = {
  red: { hue: 356 },
  orange: { hue: 24 },
  amber: { hue: 42 },
  green: { hue: 140 },
  teal: { hue: 172 },
  cyan: { hue: 190 },
  blue: { hue: 213 },
  indigo: { hue: 236 },
  purple: { hue: 272 },
  pink: { hue: 322 },
  brown: { hue: 26, saturation: 0.45 },
  grey: { hue: 213, saturation: 0.08 }
}

/** The theme every look is made from. */
const LOOK_THEME = "Tomorrow Night Blue"

/**
 * Tomorrow Night Blue's own window colours that carry its blue (VS Code's built-in
 * `extensions/theme-tomorrow-night-blue/themes/tomorrow-night-blue-color-theme.json`):  a look re-hues each.  Its
 * greys, whites and the terminal's colours stay as they are.
 */
const LOOK_COLORS = {
  focusBorder: "#bbdaff",
  "input.background": "#001733",
  "dropdown.background": "#001733",
  "list.highlightForeground": "#bbdaff",
  "pickerGroup.foreground": "#bbdaff",
  "editor.background": "#002451",
  "editor.selectionBackground": "#003f8e",
  "minimap.selectionHighlight": "#003f8e",
  "editor.lineHighlightBackground": "#00346e",
  "editorWhitespace.foreground": "#404f7d",
  "editorWidget.background": "#001c40",
  "editorHoverWidget.background": "#001c40",
  "editorGroup.border": "#404f7d",
  "editorGroupHeader.tabsBackground": "#001733",
  "editorGroup.dropBackground": "#25375daa",
  "peekViewResult.background": "#001c40",
  "tab.inactiveBackground": "#001c40",
  "debugToolBar.background": "#001c40",
  "titleBar.activeBackground": "#001126",
  "titleBar.inactiveBackground": "#0e1926",
  "statusBar.background": "#001126",
  "statusBar.inactiveBackground": "#0e1926",
  "statusBar.noFolderBackground": "#001126",
  "statusBar.debuggingBackground": "#001126",
  "activityBar.background": "#001733",
  "progressBar.background": "#bbdaffcc",
  "badge.background": "#bbdaffcc",
  "badge.foreground": "#001733",
  "panelSection.border": "#404f7d",
  "sideBar.background": "#001c40",
  "sideBarSectionHeader.border": "#404f7d",
  "panel.background": "#002451",
  "terminal.background": "#002451"
}

/** The title-bar keys a staying session's tint sets (`tint()`), and `stay --end` puts back. */
const TINT_KEYS = Object.keys(tint(""))

/**
 * Look `name`'s settings:  `{ theme, colors }`, the colours for `workbench.colorCustomizations["[<theme>]"]`;
 * throws for a name not in `LOOKS`, listing them.
 */
export function look(name) {
  const chosen = LOOKS[String(name).toLowerCase()]
  if (!chosen) throw new Error(`no look "${name}":  ${Object.keys(LOOKS).join(", ")}`)
  const colors = {}
  for (const [key, hex] of Object.entries(LOOK_COLORS)) colors[key] = rehue(hex, chosen.hue, chosen.saturation ?? 1)
  return { theme: LOOK_THEME, colors }
}

/**
 * Give window settings `settings` look `name` (in place):  the theme, and the look's colours scoped to it;  a global
 * colour the look sets goes (it would fight the look), the rest of Owen's own colours stay.  Returns `settings`.
 */
export function withLook(settings, name) {
  const { theme, colors } = look(name)
  const custom = { ...(settings["workbench.colorCustomizations"] ?? {}) }
  for (const key of Object.keys(colors)) delete custom[key]
  custom[`[${theme}]`] = { ...(custom[`[${theme}]`] ?? {}), ...colors }
  settings["workbench.colorTheme"] = theme
  settings["workbench.colorCustomizations"] = custom
  return settings
}

/**
 * A session STAYS in window file `workspace` (parsed) while it works in worktree `name` (in place;  epic
 * `windows-and-review` P5):  the window's title reads `⎇ <name>`, its title bar tinted the worktree's colour
 * (`tint()`), scoped to its theme so it shows over a look.  What it replaces is kept in `spell.stay`, for
 * `withoutStay()`;  staying again (another worktree) keeps the first one's.  Returns `workspace`.
 */
export function withStay(workspace, name) {
  const settings = (workspace.settings ??= {})
  const scope = `[${settings["workbench.colorTheme"] ?? FALLBACK_THEME}]`
  const custom = { ...(settings["workbench.colorCustomizations"] ?? {}) }
  const scoped = { ...(custom[scope] ?? {}) }
  workspace.spell ??= {}
  workspace.spell.stay ??= {
    title: settings["window.title"] ?? null,
    scope,
    colors: Object.fromEntries(TINT_KEYS.map((key) => [key, scoped[key] ?? null]))
  }
  workspace.spell.stay.name = name
  settings["window.title"] = `\${dirty}\${activeEditorShort}\${separator}⎇ ${name}\${separator}\${appName}`
  custom[scope] = { ...scoped, ...tint(name) }
  settings["workbench.colorCustomizations"] = custom
  return workspace
}

/** The stay `withStay()` began, undone (in place):  the title and title bar as they were.  Returns whether it was. */
export function withoutStay(workspace) {
  const stay = workspace.spell?.stay
  if (!stay) return false
  const settings = (workspace.settings ??= {})
  if (stay.title === null) delete settings["window.title"]
  else settings["window.title"] = stay.title
  const custom = { ...(settings["workbench.colorCustomizations"] ?? {}) }
  const scoped = { ...(custom[stay.scope] ?? {}) }
  for (const [key, value] of Object.entries(stay.colors)) {
    if (value === null) delete scoped[key]
    else scoped[key] = value
  }
  if (Object.keys(scoped).length) custom[stay.scope] = scoped
  else delete custom[stay.scope]
  if (Object.keys(custom).length) settings["workbench.colorCustomizations"] = custom
  else delete settings["workbench.colorCustomizations"]
  delete workspace.spell.stay
  if (!Object.keys(workspace.spell).length) delete workspace.spell
  return true
}

/**
 * `#rrggbb` or `#rrggbbaa` with its hue set to `hue` and its saturation scaled by `saturation`;  lightness and
 * alpha kept.
 */
function rehue(hex, hue, saturation) {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255)
  const alpha = hex.length === 9 ? hex.slice(7) : ""
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const delta = max - min
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  return `${hslHex(hue, Math.min(100, s * saturation * 100), lightness * 100)}${alpha}`
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

/** Resolve after `ms` milliseconds. */
function delay(ms) {
  return new Promise((done) => setTimeout(done, ms))
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
