/**
 * The JSON Schema of each type a compiled LIBRARY exports, written for VS Code (epic `people-and-orgs` P5, Q43):
 * `<build folder>/schemas/Person.schema.json`.
 * - What `spell compile` writes after a project's library target (`ts/lib`, its `<project>.lib.ts`).
 * - Made from the compiled class itself (`SC.jsonSchemaFor()`), so it says what the app's checker checks:
 *   never committed, never written by hand.
 * - VS Code finds one through the repo's settings (`json.schemas`), by the file's name, e.g. `__me.json5`.
 */
import { mkdirSync, statSync, writeFileSync } from "fs"
import { resolve } from "path"
import { pathToFileURL } from "url"

import { jsonSchemaFor } from "spell-parser/core/model"

/**
 * Write the JSON Schema of each type library `libFile` exports into `folder`, `<Type>.schema.json`;
 * returns the paths written.
 * - A type:  an exported class with a schema (`declareProp`), i.e. a spell thing.
 * - Imports `libFile` afresh each time (its changed time in the URL), so a watch's recompile writes the new types.
 */
export async function writeSchemas(libFile: string, folder: string): Promise<string[]> {
  const url = `${pathToFileURL(libFile).href}?at=${statSync(libFile).mtimeMs}`
  const library = (await import(url)) as Record<string, unknown>
  const wrote: string[] = []
  for (const [name, Class] of Object.entries(library)) {
    if (typeof Class !== "function" || typeof (Class as { declareProp?: unknown }).declareProp !== "function") continue
    mkdirSync(folder, { recursive: true })
    const path = resolve(folder, `${name}.schema.json`)
    writeFileSync(path, JSON.stringify(jsonSchemaFor(Class), null, 2) + "\n")
    wrote.push(path)
  }
  return wrote
}
