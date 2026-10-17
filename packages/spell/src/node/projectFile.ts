import { existsSync } from "fs"
import { resolve } from "path"

import { PROJECT_FILE, PROJECT_FILES } from "$/spell/spell.types"

/**
 * A project's file on disk, by whichever name it has:  `__project.json5`, or an old `project.json`
 * (`SP.PROJECT_FILES`, epic `people-and-orgs` P12).
 * - NODE ONLY:  it looks at the disk.
 */

/** The project file in folder `folder`, its full path:  the first name it has, `undefined` for none. */
export function projectFileIn(folder: string): string | undefined {
  for (const name of PROJECT_FILES) {
    const file = resolve(folder, name)
    if (existsSync(file)) return file
  }
  return undefined
}

/** Does folder `folder` hold a project file, by any of its names?  Then it's a project's folder. */
export function hasProjectFile(folder: string): boolean {
  return projectFileIn(folder) !== undefined
}

/** Where folder `folder`'s project file is, or would be written:  the one it has, else `__project.json5`. */
export function projectFileFor(folder: string): string {
  return projectFileIn(folder) ?? resolve(folder, PROJECT_FILE)
}
