/**
 * Spaces' OWN names:  a space's or a project's special files and folders (decision Q33).
 * - Never one of its projects or source files.
 * - Each starts with `__`, so it sorts to the top and needs no quoting in a shell.
 * - Known by this LIST, never by the `__` alone (decision J52).
 *   - Python's `__init__.py`, a tests' `__snapshots__/` or a pack template's `__Class__.tsx.template`
 *     start with `__` too, and stay one of a project's files.
 *   - Rule of thumb:  ours never END in `__`.
 * - `__project.json5` is a project's file since JSON5 Everywhere (P12):  one still named `project.json` is read too.
 */
export const SPACE_NAMES = [
  "__me.json5",
  "__org.json5",
  "__project.json5",
  "__members",
  "__settings",
  "__sessions",
  "__docs",
  "__data",
  "__friend-lists",
  "__parts",
  "__pack",
  "__prefs"
] as const

/** Is `name` (a file or folder's name, no path) one of spaces' own (`SPACE_NAMES`)? */
export function isSpaceName(name: string): boolean {
  return (SPACE_NAMES as readonly string[]).includes(name)
}
