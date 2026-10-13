/**
 * `yarn gen:syntax`:  write the spell syntax table, `spellSyntax.json`, at the package's root.
 * - Run it after adding, renaming or changing a rule, its docstring or its tests:
 *   `spellSyntax.test.ts` fails until you do.
 * - What's in it:  `spellSyntax()`.  Who reads it:  the spell syntax guide, `guides/spell-syntax/spell-syntax.html`.
 * - NODE ONLY, and NOT in the barrel:  it writes the file the moment it's imported.
 */
import { writeFileSync } from "fs"
import { resolve } from "path"

import { SPELL_SYNTAX_FILE, spellSyntax } from "$/spell/node/spellSyntax"

const path = resolve(import.meta.dirname, "../..", SPELL_SYNTAX_FILE)
writeFileSync(path, `${JSON.stringify(spellSyntax(), null, 2)}\n`)
process.stdout.write(`wrote ${path}\n`)
// NOTE: exits explicitly:  loading the core can leave timers running, which would keep the process alive
process.exit(0)
