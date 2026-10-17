import { readFileSync } from "node:fs"
import { isAbsolute, join, relative, resolve, sep } from "node:path"

// By relative path, `.ts` and all:  plain `node` loads this file (the hooks, `scripts/window.mjs`) and resolves
// nothing else.  The server's checkout finder:  the main checkout from any worktree, with no `git` run
import { checkoutOf } from "../../../server/src/checkout.ts"

/****************
 * ### `EpicConfig`
 * Where a repo keeps its epic things, read from ONE file in it:  `.epic/config.json5` (epic `epic-eject` P4).
 *
 * ```ts
 * const config = EpicConfig.of(process.cwd())   // the main checkout's file, from any worktree
 * config.contentFolder                           // => "/Users/owen/www/spell-app/spell-app-dev"
 * config.worktreeFolder("seo")                   // => "<main>/.claude/worktrees/seo"
 * config.baseBranch                              // => "main"
 * ```
 *
 * - The keys, their defaults and what reads each:  `EpicSettings`.
 *   - With no file, or a key left out:  the default, which is how spell-app worked before the file existed.
 *   - A key it doesn't know is skipped, so an older checkout reads a newer file.
 * - ONE file per repo:  the MAIN checkout's (`SRV.checkoutOf()`), so every worktree reads the same values.
 *   A branch's change to it counts once it's merged and the main checkout has it.
 * - Read fresh by `new EpicConfig()`:  nothing is cached, so a long-running page server picks up an edit at its next
 *   use of a new instance.
 * - The file is JSON5's JSON-compatible part, as every tooling data file is (`DataFile`):
 *   keys and text in double quotes, `//` and `/* *\/` comments, trailing commas.
 *   - Read here by `parse()`, not by `DataFile`, which needs the `json5` package:
 *     the hooks and the window script load this file with plain `node`, before a worktree's `yarn install`.
 *   - So `DataFile.write()` can write it later (`epic init`, epic `epic-eject` P9), keeping Owen's comments.
 * - Who reads it:  the CLI (`spell dev shared`, `stock`, `worktree` ...), the epic tool and the epics list,
 *   the hooks (`.claude/hooks/`), the window script (`scripts/window.mjs`), the running epics' route module.
 *   `epic config [key]` prints a value, for the skills.
 *   - Packages below epics never read it (the server, spaces):  they find the main checkout through git
 *     (`SRV.checkoutOf()`), or are told by epics' route module (`PageServer.serveWorktrees()`).
 * - Node only (`node:fs`):  NOT in the `$/epics` barrel, imported by path (`$/epics/config/EpicConfig`).
 * - Its position:  imports only node's own modules and the server's `checkout.ts` by its relative path, so plain
 *   `node` loads it (types stripped);  NEVER an alias, an `enum` or a parameter property.
 ****************/
export class EpicConfig {
  /** where a repo's config is, from its main checkout */
  static readonly FILE = ".epic/config.json5"

  /** every value with no file, or for a key the file leaves out:  how spell-app worked before the file existed */
  static readonly DEFAULTS: EpicSettings = {
    contentFolder: "../spell-app-dev",
    baseBranch: "main",
    worktreesFolder: ".claude/worktrees",
    installCommand: "yarn install",
    windows: { default: "spell-app", repoName: "spell-app", contentName: "spell-app-dev" },
    linkSessionFolders: false
  }

  /** the main checkout:  what the folders are relative to */
  readonly main: string

  /** the config file, `<main>/.epic/config.json5`, there or not */
  readonly file: string

  /** the values as written (folders relative to `main`), the defaults filling in what the file leaves out */
  readonly settings: EpicSettings

  /**
   * The config of the repo whose MAIN checkout is `main`.
   * - throws `SyntaxError` on a file that won't read, `TypeError` on a value of the wrong kind:  each names the file
   */
  constructor(main: string) {
    this.main = resolve(main)
    this.file = join(this.main, EpicConfig.FILE)
    this.settings = EpicConfig.settingsFrom(readOrEmpty(this.file), this.file)
  }

  /**
   * The config of the repo `path` is in:  its MAIN checkout's file, from the main checkout or any worktree.
   * - outside git:  `path` counts as the main checkout
   */
  static of(path = process.cwd()): EpicConfig {
    return new EpicConfig(EpicConfig.mainOf(path))
  }

  /** The MAIN checkout of the repo `path` is in (`SRV.checkoutOf()`);  `path` itself outside git. */
  static mainOf(path = process.cwd()): string {
    return checkoutOf(path)?.main ?? resolve(path)
  }

  ////////////////
  // ## The values
  ////////////////

  /** the shared content repo (epics, guides, sagas ...):  `contentFolder`, from the main checkout */
  get contentFolder(): string {
    return resolve(this.main, this.settings.contentFolder)
  }

  /** the branch worktrees start from and merge into */
  get baseBranch(): string {
    return this.settings.baseBranch
  }

  /** the folder holding every worktree, `<worktreesFolder>/<name>`:  `worktreesFolder`, from the main checkout */
  get worktreesFolder(): string {
    return resolve(this.main, this.settings.worktreesFolder)
  }

  /** what makes a new worktree ready to run, from its root */
  get installCommand(): string {
    return this.settings.installCommand
  }

  /** the window names:  the default window, and the folder names a window shows */
  get windows(): EpicWindows {
    return this.settings.windows
  }

  /** whether each worktree's saved-session folder is linked to the main checkout's */
  get linkSessionFolders(): boolean {
    return this.settings.linkSessionFolders
  }

  /** Worktree `name`'s folder:  `<worktreesFolder>/<name>`. */
  worktreeFolder(name: string): string {
    return join(this.worktreesFolder, name)
  }

  /**
   * The name of the worktree `path` is in (`<worktreesFolder>/<name>/...`);  `undefined` outside one.
   * - `path` under this repo's worktrees folder
   * - or, while that folder is inside the checkout (`.claude/worktrees`), under the same folder of ANY checkout:
   *   a session's `cwd`, a path `lsof` printed, a test's made-up `/repo/.claude/worktrees/seo`
   */
  worktreeNameOf(path: string | null | undefined): string | undefined {
    if (!path) return undefined
    const inside = relative(this.worktreesFolder, path)
    if (inside && !inside.startsWith("..") && !isAbsolute(inside)) return inside.split(sep)[0] || undefined
    const pattern = this.worktreesPattern
    if (!pattern) return undefined
    const marker = `${sep}${pattern.split("/").join(sep)}${sep}`
    const at = path.indexOf(marker)
    return at < 0 ? undefined : path.slice(at + marker.length).split(sep)[0] || undefined
  }

  /**
   * The worktrees folder as a path inside the checkout (`.claude/worktrees`), for a pattern in each checkout
   * (a window's `files.exclude`);  `undefined` when it's outside the checkout (`../spell-app.worktrees`).
   */
  get worktreesPattern(): string | undefined {
    const inside = relative(this.main, this.worktreesFolder)
    return inside && !inside.startsWith("..") && !isAbsolute(inside) ? inside.split(sep).join("/") : undefined
  }

  /**
   * Every value as `epic config` prints it, by dotted key:  folders absolute, the rest as written.
   * - `{ contentFolder: "/.../spell-app-dev", ..., "windows.default": "spell-app", ... }`
   */
  values(): Record<string, string | boolean> {
    return {
      contentFolder: this.contentFolder,
      baseBranch: this.baseBranch,
      worktreesFolder: this.worktreesFolder,
      installCommand: this.installCommand,
      "windows.default": this.windows.default,
      "windows.repoName": this.windows.repoName,
      "windows.contentName": this.windows.contentName,
      linkSessionFolders: this.linkSessionFolders
    }
  }

  ////////////////
  // ## Reading the file
  ////////////////

  /**
   * The settings in config text `text` (from `file`, for messages), over `DEFAULTS`.
   * - `""`:  the defaults
   * - throws `SyntaxError` on text that won't read, `TypeError` on a value of the wrong kind
   */
  static settingsFrom(text: string, file = EpicConfig.FILE): EpicSettings {
    const written = text.trim() ? EpicConfig.parse(text, file) : {}
    if (typeof written !== "object" || written === null || Array.isArray(written))
      throw new TypeError(`EpicConfig:  ${file} must hold an object, {...}`)
    const given = written as Record<string, unknown>
    const defaults = EpicConfig.DEFAULTS
    const windows = given.windows === undefined ? {} : given.windows
    if (typeof windows !== "object" || windows === null || Array.isArray(windows))
      throw new TypeError(`EpicConfig:  ${file}'s "windows" must be an object, { "default": ..., ... }`)
    const window = windows as Record<string, unknown>
    return {
      contentFolder: valueOf(given, "contentFolder", defaults.contentFolder, file),
      baseBranch: valueOf(given, "baseBranch", defaults.baseBranch, file),
      worktreesFolder: valueOf(given, "worktreesFolder", defaults.worktreesFolder, file),
      installCommand: valueOf(given, "installCommand", defaults.installCommand, file),
      windows: {
        default: valueOf(window, "default", defaults.windows.default, file, "windows."),
        repoName: valueOf(window, "repoName", defaults.windows.repoName, file, "windows."),
        contentName: valueOf(window, "contentName", defaults.windows.contentName, file, "windows.")
      },
      linkSessionFolders: valueOf(given, "linkSessionFolders", defaults.linkSessionFolders, file)
    }
  }

  /**
   * Config text `text` as data:  JSON5's JSON-compatible part, its comments and trailing commas dropped (never inside
   * a string), then plain `JSON.parse()`.
   * - throws `SyntaxError`, naming `file`
   */
  static parse(text: string, file = EpicConfig.FILE): unknown {
    const withoutComments = outsideStrings(text, (rest) => {
      if (rest.startsWith("//")) return rest.indexOf("\n") === -1 ? rest.length : rest.indexOf("\n")
      if (rest.startsWith("/*")) return rest.indexOf("*/") === -1 ? rest.length : rest.indexOf("*/") + 2
      return 0
    })
    try {
      return JSON.parse(outsideStrings(withoutComments, (rest) => (/^,\s*[}\]]/.test(rest) ? 1 : 0)))
    } catch (error) {
      throw new SyntaxError(`EpicConfig:  ${file} won't read:  ${(error as Error).message}`, { cause: error })
    }
  }
}

/**
 * What `.epic/config.json5` holds:  where a repo keeps its epic things.  Every key is optional in the file.
 * - `contentFolder`:  the shared content repo, relative to the main checkout (`../spell-app-dev`):
 *   the epics, guides, sagas and logs every checkout links in (`spell dev shared`, the turn-end commit hook)
 * - `baseBranch`:  the branch worktrees start from and merge into (`main`):
 *   the worktree hook, `spell dev worktree merge-main`, `epic merge`, the behind-main notice
 * - `worktreesFolder`:  where worktrees go, relative to the main checkout (`.claude/worktrees`), one folder each:
 *   the worktree hook, the window script, the epics list, the page server's `/worktrees/<w>/`
 * - `installCommand`:  what makes a new worktree ready to run (`yarn install`):  `/isolate`, `/epic`
 * - `windows`:  the VS Code window names (the window script)
 *   - `default`:  the window file a worktree's window is opened from when the session's window isn't a package's
 *     (`spell-app`:  `workspaces/spell-app.code-workspace`)
 *   - `repoName`:  the repo root's folder name in every window (`spell-app`)
 *   - `contentName`:  the content repo's folder name in every window (`spell-app-dev`)
 * - `linkSessionFolders`:  whether each worktree's saved-session folder is linked to the main checkout's
 *   (off).  NOTE:  nothing does the linking yet:  it's for worktrees beside the repo (epic `epic-eject` P8)
 */
export type EpicSettings = {
  contentFolder: string
  baseBranch: string
  worktreesFolder: string
  installCommand: string
  windows: EpicWindows
  linkSessionFolders: boolean
}

/** `EpicSettings.windows`:  the default window, and the folder names every window shows. */
export type EpicWindows = { default: string; repoName: string; contentName: string }

/** The text of `file`;  `""` when it isn't there. */
function readOrEmpty(file: string): string {
  try {
    return readFileSync(file, "utf8")
  } catch {
    return ""
  }
}

/**
 * `given[key]`, of the same kind as `fallback`;  `fallback` when it's left out.
 * - throws `TypeError` naming the file and the key (`prefix` + `key`) when it's another kind
 */
function valueOf<T extends string | boolean>(
  given: Record<string, unknown>,
  key: string,
  fallback: T,
  file: string,
  prefix = ""
): T {
  const value = given[key]
  if (value === undefined) return fallback
  if (typeof value !== typeof fallback || (typeof value === "string" && !value.trim()))
    throw new TypeError(
      `EpicConfig:  ${file}'s "${prefix}${key}" must be a ${typeof fallback}, not ${JSON.stringify(value)}`
    )
  return value as T
}

/** `text` without what `cut(rest)` says to cut:  how many characters, at each place outside a double-quoted string. */
function outsideStrings(text: string, cut: (rest: string) => number): string {
  let out = ""
  for (let at = 0; at < text.length;) {
    if (text[at] === '"') {
      let end = at + 1
      while (end < text.length && text[end] !== '"') end += text[end] === "\\" ? 2 : 1
      out += text.slice(at, end + 1)
      at = end + 1
      continue
    }
    const length = cut(text.slice(at))
    if (length) at += length
    else out += text[at++]
  }
  return out
}
