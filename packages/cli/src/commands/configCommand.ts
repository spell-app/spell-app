// Import directly, not through `$/cli`:  the barrel loads spell, and `epic` must start fast (`epicMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import { findCheckout } from "$/cli/findCheckout"
import { EpicConfig } from "$/epics/config/EpicConfig"

/**
 * `epic config [<key>] [--json]`:  where this repo keeps its epic things, as `.epic/config.json5` says
 * (`EpicConfig`, epic `epic-eject` P4).
 * - `<key>`:  that value alone, on a line of its own, for a skill to use in a path:
 *   `epic config contentFolder` => `/Users/owen/www/spell-app/spell-app-dev`
 *   - folders absolute;  a window name by its dotted key, `windows.default`
 * - no key:  every value, `key:  value` a line;  `--json`:  all of them as JSON
 * - the repo:  the checkout the command runs in (any worktree reads the main checkout's file), else the CLI's own
 * - Returns 0.  Throws `CliError`:  exit 2 for an unknown key, listing the keys;  1 for a file that won't read.
 */
export async function configCommand(args: string[]): Promise<number> {
  const json = args.includes("--json")
  const [key] = args.filter((arg) => !arg.startsWith("--"))
  const values = configValues()
  if (key === undefined) {
    const lines = Object.entries(values).map(([name, value]) => `${name}:  ${value}`)
    process.stdout.write(json ? `${JSON.stringify(values, null, 2)}\n` : `${lines.join("\n")}\n`)
    return EXIT.OK
  }
  if (!(key in values))
    throw new CliError(`epic config ${key}?  no such key.  The keys:  ${Object.keys(values).join(", ")}`)
  process.stdout.write(json ? `${JSON.stringify(values[key])}\n` : `${values[key]}\n`)
  return EXIT.OK
}

/** This checkout's config values (`EpicConfig.values()`);  a file that won't read is a `CliError`, exit 1. */
function configValues(): Record<string, string | boolean> {
  try {
    return EpicConfig.of(findCheckout(".git")).values()
  } catch (error) {
    throw new CliError((error as Error).message, EXIT.ERRORS)
  }
}
