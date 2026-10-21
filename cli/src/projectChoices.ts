/**
 * Completions for a half-typed project or file, as a shell completes a path -- for `<ProjectPrompt>`:
 * - nothing typed past a group yet:  recent picks, then the project groups, e.g. `@spell/examples/`
 * - a group and `/`:  its projects, e.g. `@spell/examples/drawable-solitaire/`
 * - a project and `/`:  "entire project" (`@spell/examples/drawable-solitaire`) first, then its `.spell` files,
 *   e.g. `@spell/examples/drawable-solitaire/Card.spell`
 * - Each level is filtered by what's typed after it, ignoring case.
 */
import { readdirSync } from "fs"
import { relative, resolve } from "path"

import { SP } from "spell-lang/spell"
import { CLI } from "$/cli"

/**
 * One completion.
 * - `value`:  the text it completes to;  a group or a project ends in `/`, to go on into
 * - `label`:  how to show it, if not as `value`, e.g. "entire project"
 * - `isFinal`:  picking it picks a project or a file, rather than going into it
 * - `isRecent`:  one of the recent picks
 */
export type ProjectChoice = {
  value: string
  label?: string
  isFinal: boolean
  isRecent?: boolean
}

/** Completions for `text` -- see the header.  `recents` come first while nothing's typed past a group. */
export async function projectChoices(text: string, recents: string[] = []): Promise<ProjectChoice[]> {
  const group = CLI.knownRoots().find((spec) => text.toLowerCase().startsWith(`${spec.path}/`.toLowerCase()))
  if (!group) {
    const roots = CLI.knownRoots().map((spec) => `${CLI.rootName(spec)}/`)
    const recent = recents.map((value) => ({ value, isFinal: true, isRecent: true }))
    const rootChoices = [...new Set(roots)].map((value) => ({ value, isFinal: false }))
    return [...recent, ...rootChoices].filter((choice) => startsWith(choice.value, text))
  }

  // a project is its group's address and ONE part:  a slash after that part goes into the project
  const [project = "", ...file] = text.slice(group.path.length + 1).split("/")
  if (file.length) return fileChoices(`${group.path}/${project}`, file.join("/"))
  return (await CLI.projectIdsIn([group]))
    .filter((id) => startsWith(nameOf(id), project))
    .map((id) => ({ value: `${id}/`, isFinal: false }))
}

/** A project's choices:  "entire project" while nothing's typed, then its `.spell` files that start with `typed`. */
async function fileChoices(project: string, typed: string): Promise<ProjectChoice[]> {
  const group = SP.SpellSetup.groupFor(project)
  if (!group || !(await CLI.projectIdsIn([group])).includes(project)) return []
  const files = spellFilesIn(new SP.SpellLocation(project).serverPath)
  return [
    ...(typed ? [] : [{ value: project, label: "entire project", isFinal: true }]),
    ...files
      .filter((file) => startsWith(file, typed))
      .map((file) => ({ value: SP.SpellLocation.join(project, file), isFinal: true }))
  ]
}

/** Longest start every one of `values` shares -- what `Tab` completes to. */
export function commonPrefix(values: string[]): string {
  if (!values.length) return ""
  let prefix = values[0]!
  for (const value of values) while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return prefix
}

/** Project name of `id`, e.g. `solitaire` for `@spell/examples/drawable-solitaire`. */
function nameOf(id: string): string {
  return id.slice(id.lastIndexOf("/") + 1)
}

/** `.spell` files in `folder` and below, as paths relative to it, sorted -- skipping hidden folders. */
function spellFilesIn(folder: string): string[] {
  const entries = readdirSync(folder, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".spell"))
    .map((entry) => relative(folder, resolve(entry.parentPath, entry.name)))
    .filter((path) => !path.split("/").some((part) => part.startsWith(".")))
    .sort()
}

/** Does `value` start with `typed`, ignoring case? */
function startsWith(value: string, typed: string): boolean {
  return value.toLowerCase().startsWith(typed.toLowerCase())
}
