/**
 * `spell dev ...`:  the LEAN entry, run by `bin/spell.mjs` instead of `main.ts` when the first word is `dev` (or a
 * deprecated top-level alias, `plan-doc` / `goals`).
 * - Why:  `main.ts` loads the `$/cli` barrel, and with it spell itself, ~0.5s before any command runs.  A
 *   pass-through (`spell dev plan-doc`, `docs`, `server` ...) needs only commander and `devProgram.ts`.
 * - A `spell dev` command that DOES load spell (`commands`, `session` ...) hands over to `main.ts`, which parses
 *   the same command line again and runs it as before:  same output, same speed.
 * - NOT in the barrel:  importing it runs the command line.
 */
import { devProgram, spellProgram } from "$/cli/devProgram"

// `spell plan-doc ...` / `spell goals ...`:  deprecated aliases of `spell dev plan-doc ...` / `spell dev goals ...`
if (process.argv[2] !== "dev") process.argv.splice(2, 0, "dev")

const program = spellProgram()
devProgram(program, handOver)
await program.parseAsync()

/**
 * Run the command line through `main.ts` after all:  it loads spell, sets up `consoleGuard`, and exits itself.
 * - Never resolves:  `main.ts` ends the process.
 */
async function handOver(): Promise<never> {
  await import("$/cli/main")
  return new Promise<never>(() => {})
}
