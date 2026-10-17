import { join } from "path"
import { pathToFileURL } from "url"

import { EpicTools } from "$/epics/command/EpicTools"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError } from "$/cli/cli.types"
import type { ToolSpec } from "$/cli/dev/dev.types"
import { REPO_ROOT, findCheckout } from "$/cli/findCheckout"

/**
 * The repo tools `spell dev` passes straight through to, by command:  each as its yarn script ran it.
 * - `docs <verb>`:  `packages/epics/package.json`'s `docs:<verb>`, in `packages/epics` as `yarn workspace` ran them
 *   - `open` and `link` under `tsx`:  a short address (`SAGA:/...`) is read by `$/epics/links`
 * - `docs fuss`:  the writing checker, under `tsx`, in the caller's folder (its paths are from there)
 * - `docs offline`:  what docs pages load from the internet, likewise
 * - `server`:  `packages/server`'s `server` script;  `serve`:  root `yarn serve`, `spell dev server start --all`
 * - `design build`:  `packages/ui`'s `design:build`, under `tsx`, in the caller's folder (so `--out` is relative to it)
 * - `design bundle` / `design check`:  `packages/epics`' `design:bundle` (`bundle-spell-ui.js --design`) / `design:check`
 * - `design sync`:  `packages/epics/tools/design.js`, its verb first (`pull`, `changed` ...), in the caller's folder
 * - NOTE: `vscode` runs yarn itself (`vscodeSteps()`)
 * - NOT here:  the epic tools (`details`, `choices`, `notes`, `comments`, `agents`, `airplane`, `window`), which the
 *   `epic` command runs from ITS OWN checkout, the caller's being the data (`$/epics/command/EpicTools`, epic
 *   `epic-eject` P5).  These docs and server tools still run the nearest checkout's copy, as before.
 */
export const TOOLS = {
  "docs update": { tool: "packages/epics/tools/update.js", cwd: "packages/epics" },
  "docs index": { tool: "packages/epics/tools/index.js", cwd: "packages/epics" },
  "docs new": { tool: "packages/epics/tools/new-page.js", cwd: "packages/epics" },
  "docs open": { tool: "packages/epics/tools/open.js", tsx: "packages/epics/tsconfig.json", cwd: "packages/epics" },
  "docs link": { tool: "packages/epics/tools/link.ts", tsx: "packages/epics/tsconfig.json", cwd: "packages/epics" },
  "docs fuss": { tool: "packages/epics/tools/fuss.ts", tsx: "packages/epics/tsconfig.json" },
  "docs offline": { tool: "packages/epics/tools/offline.ts", tsx: "packages/epics/tsconfig.json" },
  "design build": { tool: "packages/ui/scripts/design-build.ts", tsx: "packages/ui/scripts/tsconfig.json" },
  "design bundle": { tool: "packages/epics/tools/bundle-spell-ui.js", cwd: "packages/epics" },
  "design check": { tool: "packages/epics/tools/check-design-bundle.js", cwd: "packages/epics" },
  "design sync": { tool: "packages/epics/tools/design.js" },
  server: { tool: "packages/server/src/page/cli.ts", tsx: "packages/server/tsconfig.json" },
  serve: { tool: "scripts/serve.mjs" }
} satisfies Record<string, ToolSpec>

/** A command `TOOLS` runs, e.g. `docs open`. */
export type ToolName = keyof typeof TOOLS

/** `docs`' verbs, in the order help lists them. */
export const DOCS_VERBS = ["update", "index", "new", "open", "link", "fuss", "offline"] as const

/**
 * `design`'s verbs (epic `claude-design`), in the order help lists them.
 * - `build`, `bundle`, `check`:  write the system's files, its bundle, and prove the bundle
 * - `pull`, `changed`, `pushed`, `state`:  `packages/epics/tools/design.js` (`design sync`), the local half of `/design`
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
 * Run `command` with `args` as a child, with this terminal attached, and resolve to its exit code:
 * `EpicTools.runChild()`, the one copy (signals passed on, `128 +` a signal's number).
 */
export const runChild = EpicTools.runChild

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
 * Why `spell dev vscode` refuses to run from `branch`, `behind` commits behind base branch `main` (the repo's
 * `baseBranch`);  `undefined` when it may.
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
