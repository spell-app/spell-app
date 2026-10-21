import { spawnSync } from "node:child_process"
import { join } from "node:path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell app vscode` needs none of it
import { CLI } from "spell-kit/cli"

/** The extension, relative to spell-app's root:  its own yarn project, not a workspace. */
const VSCODE = "vscode"

/**
 * `spell app vscode [build|install] [--force]`:  the VS Code extension of the nearest spell-app checkout.
 * - `build` packs `spell-language.vsix`
 * - `install` installs it into VS Code
 * - no verb does both
 * - spell-app's `yarn vscode`, `vscode:build`, `vscode:install` alias it.
 * - Refuses (`CliError`) from a branch behind `main` (`behindMainError()`), unless `--force`.
 *   - `main`:  the repo's base branch, `baseBranch` in `.epic/config.json5` (`baseBranchOf()`)
 * - Runs `vscodeSteps()` one by one, `yarn` in `vscode/`, stopping at the first that fails.
 * - Returns the exit code of the last step run.
 */
export async function vscodeCommand(
  verb: string | undefined,
  { force = false }: { force?: boolean } = {}
): Promise<number> {
  const steps = vscodeSteps(verb)
  const root = CLI.findCheckout(join(VSCODE, "package.json"), process.cwd(), join(CLI.KIT_ROOT, "spell-app"))
  if (!force) {
    const base = baseBranchOf(root)
    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], root)
    const behind = Number(git(["rev-list", "--count", `HEAD..${base}`], root) || 0)
    const error = behindMainError(branch, behind, base)
    if (error) throw new CLI.CliError(error, CLI.EXIT.ERRORS)
  }
  for (const step of steps) {
    const code = await CLI.runChild("yarn", step, { cwd: join(root, VSCODE) })
    if (code !== CLI.EXIT.OK) return code
  }
  return CLI.EXIT.OK
}

/**
 * The yarn runs `spell app vscode [verb]` makes, in `vscode/` (its own yarn project, not a workspace):
 * - `build`:  `yarn install`, `yarn build`, `yarn package`
 * - `install`:  `yarn install-extension`
 * - none:  both
 * - Throws `CliError` for any other verb.
 */
export function vscodeSteps(verb?: string): string[][] {
  const build = [["install"], ["build"], ["package"]]
  const install = [["install-extension"]]
  if (verb === undefined) return [...build, ...install]
  if (verb === "build") return build
  if (verb === "install") return install
  throw new CLI.CliError(`unknown verb '${verb}':  build, install, or none for both`)
}

/**
 * Why `spell app vscode` refuses to run from `branch`, `behind` commits behind base branch `main`;
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

/**
 * The base branch of the repo checkout `root` is in:  `epic config baseBranch` (spell-epic's `EpicConfig`, the one
 * reader of `.epic/config.json5`);  `main` when `epic` can't say.
 */
export function baseBranchOf(root: string): string {
  const bin = CLI.epicBin(root)
  const [command, args] = bin === "epic" ? [bin, []] : [process.execPath, [bin]]
  const run = spawnSync(command, [...args, "config", "baseBranch"], { cwd: root, encoding: "utf8" })
  return (run.status === 0 && run.stdout.trim()) || "main"
}

/** `git <args>` in `cwd`:  its output, trimmed;  `""` when it fails. */
function git(args: string[], cwd: string): string {
  const run = spawnSync("git", args, { cwd, encoding: "utf8" })
  return run.status === 0 ? run.stdout.trim() : ""
}
