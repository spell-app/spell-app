import { spawn } from "child_process"
import { constants } from "os"
import { join } from "path"
import { pathToFileURL } from "url"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import type { ToolSpec } from "$/cli/dev/dev.types"
import { REPO_ROOT, findCheckout } from "$/cli/findCheckout"

/**
 * The repo tools `spell dev` passes straight through to, by command:  each as its yarn script ran it.
 * - `docs <verb>`:  `packages/docs/package.json`'s `docs:<verb>`, in `packages/docs` as `yarn workspace` ran them
 * - `docs fuss`:  the writing checker, under `tsx`, in the caller's folder (its paths are from there)
 * - `docs offline`:  what docs pages load from the internet, likewise
 * - `server`:  `packages/server`'s `server` script;  `serve`:  root `yarn serve`, `spell dev server start --all`
 * - `window`:  root `yarn window`;  plain `node`, so it runs in a worktree before its `yarn install`
 * - `design build`:  `packages/ui`'s `design:build`, under `tsx`, in the caller's folder (so `--out` is relative to it)
 * - `design bundle` / `design check`:  `packages/docs`' `design:bundle` (`bundle-spell-ui.js --design`) / `design:check`
 * - `design sync`:  `packages/docs/tools/design.js`, its verb first (`pull`, `changed` ...), in the caller's folder
 * - `agents`:  the running-agents list (`packages/docs/tools/AgentList.ts`), in the caller's folder
 * - `airplane`:  airplane mode and its pre-flight check (`packages/docs/tools/airplane.ts`), in the caller's folder
 * - `notes`:  page notes (`packages/docs/tools/notes.ts`), in the caller's folder (`answer --file` is from there)
 * - `comments`:  comments on docs pages (`packages/docs/tools/comments.ts`), likewise
 * - NOTE: `goals` has its own lookup (`goalsCommand()`);  `vscode` runs yarn itself (`vscodeSteps()`);
 *   `plan-doc` runs in this process (`planDocCommand()`, epic `epic-components` P7)
 */
export const TOOLS = {
  agents: { tool: "packages/docs/tools/agents.ts", tsx: "packages/docs/tsconfig.json" },
  airplane: { tool: "packages/docs/tools/airplane.ts", tsx: "packages/docs/tsconfig.json" },
  "docs update": { tool: "packages/docs/tools/update.js", cwd: "packages/docs" },
  "docs index": { tool: "packages/docs/tools/index.js", cwd: "packages/docs" },
  "docs new": { tool: "packages/docs/tools/new-page.js", cwd: "packages/docs" },
  "docs open": { tool: "packages/docs/tools/open.js", cwd: "packages/docs" },
  "docs link": { tool: "packages/docs/tools/link.ts", tsx: "packages/docs/tsconfig.json", cwd: "packages/docs" },
  "docs fuss": { tool: "packages/docs/tools/fuss.ts", tsx: "packages/docs/tsconfig.json" },
  "docs offline": { tool: "packages/docs/tools/offline.ts", tsx: "packages/docs/tsconfig.json" },
  details: { tool: "packages/docs/tools/details.js", cwd: "packages/docs" },
  choices: { tool: "packages/docs/tools/choices.js", cwd: "packages/docs" },
  notes: { tool: "packages/docs/tools/notes.ts", tsx: "packages/docs/tsconfig.json" },
  comments: { tool: "packages/docs/tools/comments.ts", tsx: "packages/docs/tsconfig.json" },
  "design build": { tool: "packages/ui/scripts/design-build.ts", tsx: "packages/ui/scripts/tsconfig.json" },
  "design bundle": { tool: "packages/docs/tools/bundle-spell-ui.js", cwd: "packages/docs" },
  "design check": { tool: "packages/docs/tools/check-design-bundle.js", cwd: "packages/docs" },
  "design sync": { tool: "packages/docs/tools/design.js" },
  server: { tool: "packages/server/src/page/cli.ts", tsx: "packages/server/tsconfig.json" },
  serve: { tool: "scripts/serve.mjs" },
  window: { tool: "scripts/window.mjs" }
} satisfies Record<string, ToolSpec>

/** A command `TOOLS` runs, e.g. `docs open`. */
export type ToolName = keyof typeof TOOLS

/** `docs`' verbs, in the order help lists them. */
export const DOCS_VERBS = ["update", "index", "new", "open", "link", "fuss", "offline"] as const

/**
 * `design`'s verbs (epic `claude-design`), in the order help lists them.
 * - `build`, `bundle`, `check`:  write the system's files, its bundle, and prove the bundle
 * - `pull`, `changed`, `pushed`, `state`:  `packages/docs/tools/design.js` (`design sync`), the local half of `/design`
 */
export const DESIGN_VERBS = ["build", "bundle", "check", "pull", "changed", "pushed", "state"] as const

/**
 * Run tool `name` of the nearest checkout from the current folder (`findCheckout()`), with `args` verbatim and
 * this terminal attached.  Returns its exit code.
 * - a child `node`, under the CLI checkout's `tsx` when `tsx` is set:  the tool's own `tsconfig.json` then maps its
 *   `$/...` imports into the TOOL's checkout, which may be a worktree while `spell` runs from main
 * - `env`:  added to this process's
 */
export function runTool(name: ToolName, args: string[], env: NodeJS.ProcessEnv = {}): Promise<number> {
  const spec: ToolSpec = TOOLS[name]
  const root = findCheckout(spec.tool)
  return runChild(process.execPath, [...toolArgs(spec, root), ...args], {
    cwd: spec.cwd ? join(root, spec.cwd) : process.cwd(),
    env: { ...process.env, ...(spec.tsx ? { TSX_TSCONFIG_PATH: join(root, spec.tsx) } : {}), ...env }
  })
}

/** `node`'s arguments before the tool's own, for `spec` in checkout `root`:  the `tsx` loader if any, the script. */
export function toolArgs(spec: ToolSpec, root: string): string[] {
  return spec.tsx ? ["--import", TSX_LOADER, join(root, spec.tool)] : [join(root, spec.tool)]
}

/** The CLI checkout's own `tsx` loader:  a worktree's tool runs before the worktree has a `node_modules`. */
export const TSX_LOADER = pathToFileURL(join(REPO_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href

/**
 * Run `command` with `args` as a child, with this terminal attached, and resolve to its exit code.
 * - `Ctrl-C` reaches the child from the terminal itself, so this process ignores it until the child is done:
 *   a foreground server (`server serve`, `goals serve`) gets to stop cleanly, and we exit with its code
 * - `SIGTERM` / `SIGHUP` sent to us alone are passed on
 * - killed by a signal:  `128 +` its number, as a shell reports it;  failed to start:  `EXIT.ERRORS`, saying why
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

/** Signals `runChild()` passes on to its child:  they come to us alone, not from the terminal. */
const PASSED_SIGNALS: NodeJS.Signals[] = ["SIGTERM", "SIGHUP"]

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
