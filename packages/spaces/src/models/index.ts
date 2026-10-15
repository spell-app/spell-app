/**
 * Spaces' models:  project groups and lists, a project's file edits -- safe in a browser.
 * - `PROJECT_GROUPS`:  spell's project groups;  SIDE EFFECT:  loading this registers them with spell.
 * - `SpellProjectRoot`:  a group's list of projects, and its project create, copy, rename and delete.
 * - `ProjectFiles`:  a project's file create, copy, rename and delete (decision Q20).
 * - `SPACE_NAMES`:  spaces' own `__` names, never a project's file.
 * - `SpaceStorage`:  where spaces' files are kept (a type;  the disk's is `$/spaces/server/node/storage/DiskStorage`).
 * - `PersonView`, `MeAnswer` ...:  what the app and the server say about people (types, epic `people-and-orgs` P9).
 * - NOTE: nothing here may touch `node:*`, `process` or the disk:  the editor imports it.
 *   Node-only code is `$/spaces/server/node/...`.
 */
export * from "./projectGroups"
export * from "./spaceNames"
export * from "./SpellProjectRoot"
export * from "./ProjectFiles"
export type * from "./SpaceStorage"
export type * from "./people"
