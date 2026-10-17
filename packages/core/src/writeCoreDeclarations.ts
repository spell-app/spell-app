/**
 * `yarn gen:declarations`:  write the core's method list, `core.declarations.json5`, at the package's root.
 * - Run it after adding, renaming or removing anything on `core`:  `coreDeclarations.test.ts` fails until you do.
 * - What's in it, and what's left out:  `coreDeclarations()`.
 * - NODE ONLY, and NOT in the barrel:  it writes the file the moment it's imported.
 */
import { writeFileSync } from "fs"
import { resolve } from "path"

import { coreDeclarations } from "./coreDeclarations"

const path = resolve(import.meta.dirname, "..", "core.declarations.json5")
writeFileSync(path, JSON.stringify(coreDeclarations(), null, 2) + "\n")
process.stdout.write(`wrote ${path}\n`)
// NOTE: exits explicitly:  loading the core can leave timers running, which would keep the process alive
process.exit(0)
