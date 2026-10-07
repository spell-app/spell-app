/**
 * Completions for a half-typed project or file, as a shell completes a path -- for `<ProjectPrompt>`:
 * - nothing typed yet:  recent picks, then the project roots, e.g. `@examples/`
 * - a root and `/`:  its projects, e.g. `@examples/Solitaire/`
 * - a project and `/`:  "entire project" (`@examples/Solitaire`) first, then its `.spell` files
 * - Each level is filtered by what's typed after its last `/`, ignoring case.
 */
import { readdirSync } from "fs"
import { relative, resolve } from "path"

import { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * One completion.
 * - `value`:  the text it completes to;  a root or project ends in `/`, to go on into
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

/** Completions for `text` -- see the header.  `recents` come first while nothing's typed past a root. */
export async function projectChoices(text: string, recents: string[] = []): Promise<ProjectChoice[]> {
  const parts = text.split("/")
  if (parts.length === 1) {
    const roots = CLI.knownRoots().map((spec) => `${CLI.rootName(spec)}/`)
    const recent = recents.map((value) => ({ value, isFinal: true, isRecent: true }))
    const rootChoices = [...new Set(roots)].map((value) => ({ value, isFinal: false }))
    return [...recent, ...rootChoices].filter((choice) => startsWith(choice.value, text))
  }

  const [rootArg, projectName = "", ...rest] = parts
  const roots = CLI.rootsNamed(rootArg!)
  if (!roots.length) return []
  const projectIds = await CLI.projectIdsIn(roots)
  if (parts.length === 2) {
    return projectIds
      .map((id) => ({ value: `${rootArg}/${nameOf(id)}/`, isFinal: false }))
      .filter((choice) => startsWith(nameOf(choice.value.slice(0, -1)), projectName))
  }

  const projectId = projectIds.find((id) => nameOf(id) === projectName)
  if (!projectId) return []
  const project = `${rootArg}/${projectName}`
  const typed = rest.join("/")
  const files = spellFilesIn(new SP.SpellLocation(projectId).serverPath)
  return [
    { value: project, label: "entire project", isFinal: true },
    ...files.map((file) => ({ value: `${project}/${file}`, isFinal: true }))
  ].filter((choice) => (choice.value === project ? !typed : startsWith(choice.value.slice(project.length + 1), typed)))
}

/** Longest start every one of `values` shares -- what `Tab` completes to. */
export function commonPrefix(values: string[]): string {
  if (!values.length) return ""
  let prefix = values[0]!
  for (const value of values) while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return prefix
}

/** Project name of `id`, e.g. `Solitaire` for `@system:examples:Solitaire`. */
function nameOf(id: string): string {
  return id.slice(Math.max(id.lastIndexOf(":"), id.lastIndexOf("/")) + 1)
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
