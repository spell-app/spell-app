/**
 * `epic ...`:  the entry of the `epic` command, run by `bin/epic.mjs` (and by `bin/spell.mjs` for the old spelling,
 * `spell epic ...`).
 * - A thin entry:  the command itself is the epic code's, `EpicProgram` (`$/epics/command/`), which every verb
 *   runs in, without spell (epic `epic-eject` P5).
 * - Why lean:  `main.ts` loads the `$/cli` barrel, and with it spell itself, ~0.5s before any command runs.
 * - NOT in the barrel:  importing it runs the command line.
 */
import { EpicProgram } from "$/epics/command/EpicProgram"

// `spell epic ...`:  the old spelling;  from here on, the command line reads as `epic ...`
if (process.argv[2] === "epic") process.argv.splice(2, 1)

await new EpicProgram().parse()
