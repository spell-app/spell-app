import { spawnSync } from "child_process"
import { join } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import { behindMainError, epicBin, runChild, vscodeSteps } from "$/cli/dev/passThrough"
import { findCheckout } from "$/cli/findCheckout"

/** The extension, relative to a checkout's root:  its own yarn project, not a workspace. */
const VSCODE = "vscode"

/**
 * `spell dev vscode [build|install] [--force]`:  the VS Code extension of the nearest checkout.
 * - `build` packs `spell-language.vsix`
 * - `install` installs it into VS Code
 * - no verb does both
 * - Root `yarn vscode`, `vscode:build`, `vscode:install` alias it.
 * - Refuses (`CliError`) from a branch behind `main` (`behindMainError()`), unless `--force`.
 *   - `main`:  the repo's base branch, `baseBranch` in `.epic/config.json5` (`baseBranchOf()`)
 * - Runs `vscodeSteps()` one by one, `yarn` in `packages/vscode`, stopping at the first that fails.
 * - Returns the exit code of the last step run.
 */
export async function vscodeCommand(args: string[]): Promise<number> {
  const force = args.includes("--force")
  const steps = vscodeSteps(args.find((arg) => arg !== "--force"))
  const root = findCheckout(join(VSCODE, "package.json"))
  if (!force) {
    const base = baseBranchOf(root)
    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], root)
    const behind = Number(git(["rev-list", "--count", `HEAD..${base}`], root) || 0)
    const error = behindMainError(branch, behind, base)
    if (error) throw new CliError(error, EXIT.ERRORS)
  }
  for (const step of steps) {
    const code = await runChild("yarn", step, { cwd: join(root, VSCODE) })
    if (code !== EXIT.OK) return code
  }
  return EXIT.OK
}

/**
 * The base branch of the repo checkout `root` is in:  `epic config baseBranch` (spell-epic's `EpicConfig`, the one
 * reader of `.epic/config.json5`);  `main` when `epic` can't say.
 */
export function baseBranchOf(root: string): string {
  const bin = epicBin(root)
  const [command, args] = bin === "epic" ? [bin, []] : [process.execPath, [bin]]
  const run = spawnSync(command, [...args, "config", "baseBranch"], { cwd: root, encoding: "utf8" })
  return (run.status === 0 && run.stdout.trim()) || "main"
}

/** `git <args>` in `cwd`:  its output, trimmed;  `""` when it fails. */
function git(args: string[], cwd: string): string {
  const run = spawnSync("git", args, { cwd, encoding: "utf8" })
  return run.status === 0 ? run.stdout.trim() : ""
}
