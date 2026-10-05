import { CLI } from "$/cli"

/**
 * `spell dev park <verb> ...`:  parked and waiting work, for `/park`, `/unpark` and `/wait-for` (was `status.py`).
 * - `list`:  JSON:  every parked worktree's note (`PARKED-<name>.md`):  name, file, state, where it stopped
 * - `candidates`:  JSON:  what `/wait-for ?` offers:  unfinished worktrees and epics, running sessions
 * - `wait <name> [--every 60] [--max 7140]`:  poll until `<name>` finishes, then print its status JSON.  Exits `0`
 *   finished, `2` `--max` seconds passed (run it again), `3` nothing named `<name>`.
 * - Where a name stands, without waiting:  `spell dev worktree status <name>`.
 * - The logic:  `src/dev/parking.ts`.
 */
export async function parkCommand(session: CLI.CliSession, args: string[], options: CLI.ParkOptions): Promise<number> {
  const [verb, name] = args
  switch (verb) {
    case "list":
      session.out(JSON.stringify(CLI.parkedNotes(), null, 2))
      return CLI.EXIT.OK
    case "candidates":
      session.out(JSON.stringify(CLI.waitCandidates(), null, 2))
      return CLI.EXIT.OK
    case "wait": {
      if (!name) throw new CLI.CliError("wait:  which name?")
      const result = await CLI.waitFor(name, Number(options.every ?? 60), Number(options.max ?? 7140))
      session.out(result.status ? JSON.stringify(result.status, null, 2) : (result.message ?? ""))
      return result.code
    }
    default:
      throw new CLI.CliError(`unknown verb '${verb ?? ""}':  list, candidates or wait`)
  }
}
