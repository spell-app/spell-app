import { spawn } from "child_process"
import { existsSync, realpathSync } from "fs"
import { constants } from "os"
import { join } from "path"
import { pathToFileURL } from "url"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import type { ToolSpec } from "$/cli/dev/dev.types"
import { REPO_ROOT, findCheckout } from "$/cli/findCheckout"

/**
 * The repo tools `spell dev` passes straight through to, by command:  each as its yarn script ran it.
 * - `server`:  `packages/server`'s `server` script;  `serve`:  root `yarn serve`, `spell dev server start --all`
 * - `design build`:  `packages/ui`'s `design:build`, under `tsx`, in the caller's folder (so `--out` is relative to it)
 * - `design bundle` / `design check`:  the epic engine's `design:bundle` (`bundle-spell-ui.js --design`) /
 *   `design:check`, in spell-epic, through the checkout's `spell-epic` link (`ENGINE`)
 * - `design sync`:  the engine's `src/tools/design.js`, its verb first (`pull`, `changed` ...), in the caller's folder
 * - NOTE: `vscode` runs yarn itself (`vscodeSteps()`)
 * - NOT here:  the epic tools, the docs tools (`spell dev docs`) among them.
 *   - They're spell-epic's (epic `epic-eject` I5), run by the `epic` command (`epicBin()`):
 *     `spell dev docs <verb>` is `epic pages <verb>`, `spell dev details` is `epic ask` ... (`devProgram.ts`).
 *   - The design tools above are the exception, for now:  `epic` has no verb for them, so they run straight from
 *     spell-epic's folder (a later move to `ui`, with the design system's own build).
 */
export const TOOLS = {
  "design build": { tool: "packages/ui/scripts/design-build.ts", tsx: "packages/ui/scripts/tsconfig.json" },
  "design bundle": { tool: "spell-epic/src/tools/bundle-spell-ui.js", cwd: "spell-epic" },
  "design check": { tool: "spell-epic/src/tools/check-design-bundle.js", cwd: "spell-epic" },
  "design sync": { tool: "spell-epic/src/tools/design.js" },
  server: { tool: "packages/server/src/page/cli.ts", tsx: "packages/server/tsconfig.json" },
  serve: { tool: "scripts/serve.mjs" }
} satisfies Record<string, ToolSpec>

/** A command `TOOLS` runs, e.g. `docs open`. */
export type ToolName = keyof typeof TOOLS

/** `docs`' verbs, in the order help lists them:  `epic pages`' (`spell dev docs <verb>` hands each on to it). */
export const DOCS_VERBS = ["update", "index", "new", "open", "link", "fuss", "offline"] as const

/**
 * `design`'s verbs (epic `claude-design`), in the order help lists them.
 * - `build`, `bundle`, `check`:  write the system's files, its bundle, and prove the bundle
 * - `pull`, `changed`, `pushed`, `state`:  the engine's `src/tools/design.js` (`design sync`), the local half of `/design`
 */
export const DESIGN_VERBS = ["build", "bundle", "check", "pull", "changed", "pushed", "state"] as const

/**
 * Run tool `name` of the nearest checkout from the current folder (`findCheckout()`),
 * with `args` verbatim and this terminal attached.  Returns its exit code.
 * - a child `node`, under the CLI checkout's `tsx` when `tsx` is set:
 *   the tool's own `tsconfig.json` then maps its `$/...` imports into the TOOL's checkout,
 *   which may be a worktree while `spell` runs from main
 * - `env`:  added to this process's
 */
export function runTool(name: ToolName, args: string[], env: NodeJS.ProcessEnv = {}): Promise<number> {
  const spec: ToolSpec = TOOLS[name]
  const root = findCheckout(spec.tool)
  return runChild(process.execPath, [...toolArgs(spec, root), ...args], {
    cwd: spec.cwd ? join(root, spec.cwd) : process.cwd(),
    env: {
      ...process.env,
      ...(spec.tsx ? { TSX_TSCONFIG_PATH: join(root, spec.tsx) } : {}),
      ...(spec.tool.startsWith(`${ENGINE}/`) ? engineEnv(root) : {}),
      ...env
    }
  })
}

/**
 * What an engine tool run through checkout `root`'s `spell-epic` link needs to work on THAT checkout, as `epic` tells
 * its tools:  `EPIC_CHECKOUT`, its data;  `SPELL_UI_DIR`, its Spell UI (the design bundle's, not spell-epic's own
 * `.spell-app`'s);  `SPELL_BRAND_DIR`, its brand (the design bundle's `<brand-*>` elements:  read once spell-epic
 * stops finding the brand beside Spell UI, epic `repo-split` P5).
 */
export function engineEnv(root: string): NodeJS.ProcessEnv {
  return {
    EPIC_CHECKOUT: root,
    SPELL_UI_DIR: join(root, "packages", "ui"),
    SPELL_BRAND_DIR: join(root, "packages", "brand")
  }
}

/**
 * `node`'s arguments before the tool's own, for `spec` in checkout `root`:  the `tsx` loader if any, the script.
 * - the script by its REAL path:  one through the `spell-epic` link runs only when it's its own `argv[1]`
 *   (`import.meta.url`, which node gives as the real path, against `process.argv[1]`)
 */
export function toolArgs(spec: ToolSpec, root: string): string[] {
  const script = realOrSelf(join(root, spec.tool))
  return spec.tsx ? ["--import", TSX_LOADER, script] : [script]
}

/** `path` with its links resolved;  as given when it isn't there. */
function realOrSelf(path: string): string {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}

/** The CLI checkout's own `tsx` loader:  a worktree's tool runs before the worktree has a `node_modules`. */
export const TSX_LOADER = pathToFileURL(join(REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href

/**
 * Run `command` with `args` as a child, with this terminal attached, and resolve to its exit code.
 * - `Ctrl-C` reaches the child from the terminal itself, so this process ignores it until the child is done:
 *   a foreground server (`server serve`) gets to stop cleanly, and we exit with its code
 * - `SIGTERM` / `SIGHUP` sent to us alone are passed on
 * - killed by a signal:  `128 +` its number, as a shell reports it;  failed to start:  `EXIT.ERRORS`, saying why
 * - as spell-epic's `EpicTools.runChild()`, which this package can't import (no spell-app source imports the engine)
 */
export function runChild(
  command: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<number> {
  const child = spawn(command, args, { ...options, stdio: "inherit" })
  const ignore = () => {}
  const pass = (signal: NodeJS.Signals) => child.kill(signal)
  process.on("SIGINT", ignore)
  for (const signal of PASSED_SIGNALS) process.on(signal, pass)
  return new Promise((done) => {
    child.on("error", (error) => {
      process.stderr.write(`${command}:  ${error.message}\n`)
      finish(EXIT.ERRORS)
    })
    child.on("exit", (code, signal) => finish(code ?? 128 + (signal ? constants.signals[signal] : 0)))

    /** Stop listening for signals, and resolve to `code`. */
    function finish(code: number) {
      process.off("SIGINT", ignore)
      for (const signal of PASSED_SIGNALS) process.off(signal, pass)
      done(code)
    }
  })
}

/** The signals `runChild()` passes on to its child (`SIGINT` reaches it from the terminal). */
const PASSED_SIGNALS: NodeJS.Signals[] = ["SIGTERM", "SIGHUP"]

////////////////
// ## The `epic` command
////////////////

/**
 * The epic engine's link at a checkout's root:  spell-epic (`engineFolder` in `.epic/config.json5`, made by
 * `epic shared link`;  epic `epic-eject` I5).
 */
export const ENGINE = "spell-epic"

/**
 * The `epic` command to run:  spell-epic's `bin/epic`, through the `spell-epic` link of the nearest checkout that has
 * one (`findCheckout()`, else this one);  else plain `epic`, on the `PATH`.
 * - `from`:  where to look from, default the current folder
 */
export function epicBin(from = process.cwd()): string {
  const bin = join(ENGINE, "bin", "epic")
  const linked = join(findCheckout(bin, from), bin)
  return existsSync(linked) ? linked : existsSync(join(REPO_ROOT, bin)) ? join(REPO_ROOT, bin) : "epic"
}

/**
 * Run `epic <args>`, with this terminal attached;  resolves to its exit code.
 * - what every old spelling of an epic verb hands on to (`spell dev plan-doc`, `spell dev docs`, `spell epic` ...):
 *   spell-epic's command, which runs ITS code on the caller's checkout's data
 * - `bin`:  which `epic` (`epicBin()`);  a path runs under this `node`, plain `epic` from the `PATH`
 */
export function runEpic(args: string[], bin = epicBin()): Promise<number> {
  return bin === "epic" ? runChild(bin, args) : runChild(process.execPath, [bin, ...args])
}

/**
 * The yarn runs `spell dev vscode [verb]` makes, in `packages/vscode` (its own yarn project, not a workspace):
 * - `build`:  `yarn install`, `yarn build`, `yarn package` (root `vscode:build`)
 * - `install`:  `yarn install-extension` (root `vscode:install`)
 * - none:  both (root `vscode`)
 * - Throws `CliError` for any other verb.
 */
export function vscodeSteps(verb?: string): string[][] {
  const build = [["install"], ["build"], ["package"]]
  const install = [["install-extension"]]
  if (verb === undefined) return [...build, ...install]
  if (verb === "build") return build
  if (verb === "install") return install
  throw new CliError(`unknown verb '${verb}':  build, install, or none for both`)
}

/**
 * Why `spell dev vscode` refuses to run from `branch`, `behind` commits behind base branch `main`;
 * `undefined` when it may.
 * - `main`:  the repo's `baseBranch`
 * - `main` itself, or a branch with all of `main` in it, may
 * - Why:  every VS Code window runs the ONE installed extension,
 *   so one built from an older branch downgrades them all
 */
export function behindMainError(branch: string, behind: number, main: string): string | undefined {
  if (branch === main || behind <= 0) return undefined
  return (
    `${branch} is ${behind} commit${behind === 1 ? "" : "s"} behind ${main}:  building the extension from it would downgrade every window.  ` +
    `Merge ${main} first (\`epic worktree merge-main\`), or pass --force.`
  )
}
