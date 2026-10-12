/**
 * `epic ...`:  the LEAN entry of the `epic` command, run by `bin/epic.mjs` (and by `bin/spell.mjs` for the old
 * spelling, `spell epic ...`).
 * - Why lean:  `main.ts` loads the `$/cli` barrel, and with it spell itself, ~0.5s before any command runs.
 *   An epic page's verbs need only commander, `epicProgram.ts` and the plan-doc tool.
 * - `send`, `requests`, `file`, `home` and `merge` DO need the barrel (the session helpers):
 *   they're handed over to `main.ts`, as `spell epic <verb>`, which runs them as before.
 * - NOT in the barrel:  importing it runs the command line.
 */
import { epicProgram } from "$/cli/epicProgram"

// `spell epic ...`:  the old spelling;  from here on, the command line reads as `epic ...`
if (process.argv[2] === "epic") process.argv.splice(2, 1)

await epicProgram(handOver).parseAsync()

/**
 * Run the command line through `main.ts` after all, as `spell epic <verb> ...`:  it loads spell, sets up
 * `consoleGuard`, and exits itself.
 * - Never resolves:  `main.ts` ends the process.
 */
async function handOver(): Promise<never> {
  process.argv.splice(2, 0, "epic")
  await import("$/cli/main")
  return new Promise<never>(() => {})
}
