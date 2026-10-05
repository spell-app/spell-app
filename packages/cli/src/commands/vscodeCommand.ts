import { join } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { EXIT } from "$/cli/cli.types"
import { runChild, vscodeSteps } from "$/cli/dev/passThrough"
import { findCheckout } from "$/cli/findCheckout"

/** The extension, relative to a checkout's root:  its own yarn project, not a workspace. */
const VSCODE = join("packages", "vscode")

/**
 * `spell dev vscode [build|install]`:  the VS Code extension of the nearest checkout -- `build` packs
 * `spell-language.vsix`, `install` installs it into VS Code, no verb does both.
 * - Root `yarn vscode`, `vscode:build`, `vscode:install` alias it.
 * - Runs `vscodeSteps()` one by one, `yarn` in `packages/vscode`, stopping at the first that fails.
 * - Returns the exit code of the last step run.
 */
export async function vscodeCommand(args: string[]): Promise<number> {
  const steps = vscodeSteps(args[0])
  const cwd = join(findCheckout(join(VSCODE, "package.json")), VSCODE)
  for (const step of steps) {
    const code = await runChild("yarn", step, { cwd })
    if (code !== EXIT.OK) return code
  }
  return EXIT.OK
}
