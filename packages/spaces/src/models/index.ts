/**
 * Spaces' models:  project groups and lists, a project's file edits -- safe in a browser.
 * - `PROJECT_GROUPS`:  spell's project groups;  SIDE EFFECT:  loading this registers them with spell.
 * - `SpellProjectRoot`:  a group's list of projects, and its project create, copy, rename and delete.
 * - `ProjectFiles`:  a project's file create, copy, rename and delete (decision Q20).
 * - `SPACE_NAMES`:  spaces' own `__` names, never a project's file.
 * - Next:  people and orgs (epic `people-and-orgs` P5-P9).
 * - NOTE: nothing here may touch `node:*`, `process` or the disk:  the editor imports it.
 *   Node-only code is `$/spaces/server/node/...`.
 */
export * from "./projectGroups"
export * from "./spaceNames"
export * from "./SpellProjectRoot"
export * from "./ProjectFiles"
