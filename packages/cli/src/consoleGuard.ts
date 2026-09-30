/**
 * SIDE EFFECT:  keeps spell's own logging off the terminal.  `main.ts` imports this FIRST, before anything
 * which logs as it loads, e.g. `environment.ts`.
 * - Spell logs a lot:  every `SpellLocation.serverPath` lookup, task lists, parse errors via `spellCore.console`.
 * - Default:  `console.*` output is dropped.  The CLI writes its own output straight to `process.stdout` / `stderr`.
 * - `--verbose`:  `console.*` goes to stderr, so stdout stays clean, e.g. for `spell compile --stdout`.
 * - NOTE: Ink screens MUST render with `patchConsole: false`, or Ink puts `console.*` back on screen.
 */
import { format } from "util"

/** `console` methods which print. */
const PRINTING = ["log", "info", "debug", "warn", "error", "trace", "dir", "dirxml", "table"] as const

const print = process.argv.includes("--verbose")
  ? (...args: unknown[]) => void process.stderr.write(`${format(...args)}\n`)
  : () => {}
for (const method of PRINTING) console[method] = print
