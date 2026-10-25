/**
 * Spaces' models:  project groups and lists, a project's file edits -- safe in a browser.
 * - `PROJECT_GROUPS`:  spell's project groups;  SIDE EFFECT:  loading this registers them with spell.
 * - `SPELL_UI_PACK`:  Spell UI, as a spellx drawing names its components bare;  SIDE EFFECT:  registers it with spell.
 * - `SpellProjectRoot`:  a group's list of projects, and its project create, copy, rename and delete.
 * - `ProjectFiles`:  a project's file create, copy, rename and delete (decision Q20).
 * - `TypeSchemas`:  a spell type's properties, from its project's declarations, for a property editor.
 * - `SPACE_NAMES`:  spaces' own `__` names, never a project's file.
 * - `SpaceStorage`:  where spaces' files are kept (a type;  the disk's is `spell-app/spaces/server/node/storage/DiskStorage`).
 * - `PersonView`, `MeAnswer` ...:  what the app and the server say about people (types, epic `people-and-orgs` P9).
 * - NOTE: nothing here may touch `node:*`, `process` or the disk:  the editor imports it.
 *   Node-only code is `spell-app/spaces/server/node/...`.
 */
export * from "./projectGroups"
export * from "./spellUIPack"
export * from "./spaceNames"
export * from "./SpellProjectRoot"
export * from "./TypeSchemas"
export * from "./ProjectFiles"
export type * from "./SpaceStorage"
export type * from "./people"
