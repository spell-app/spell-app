import { join } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import { git } from "$/cli/dev/git"
import { behindMainError, runChild, vscodeSteps } from "$/cli/dev/passThrough"
import { findCheckout } from "$/cli/findCheckout"

/** The extension, relative to a checkout's root:  its own yarn project, not a workspace. */
const VSCODE = join("packages", "vscode")

/**
 * `spell dev vscode [build|install] [--force]`:  the VS Code extension of the nearest checkout -- `build` packs
 * `spell-language.vsix`, `install` installs it into VS Code, no verb does both.
 * - Root `yarn vscode`, `vscode:build`, `vscode:install` alias it.
 * - Refuses (`CliError`) from a branch behind `main` (`behindMainError()`), unless `--force`.
 * - Runs `vscodeSteps()` one by one, `yarn` in `packages/vscode`, stopping at the first that fails.
 * - Returns the exit code of the last step run.
 */
export async function vscodeCommand(args: string[]): Promise<number> {
  const force = args.includes("--force")
  const steps = vscodeSteps(args.find((arg) => arg !== "--force"))
  const root = findCheckout(join(VSCODE, "package.json"))
  if (!force) {
    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], root).out
    const behind = Number(git(["rev-list", "--count", "HEAD..main"], root).out || 0)
    const error = behindMainError(branch, behind)
    if (error) throw new CliError(error, EXIT.ERRORS)
  }
  for (const step of steps) {
    const code = await runChild("yarn", step, { cwd: join(root, VSCODE) })
    if (code !== EXIT.OK) return code
  }
  return EXIT.OK
}
