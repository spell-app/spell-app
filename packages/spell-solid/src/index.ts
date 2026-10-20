/**
 * REFACTOR: `$/spell-solid`, spell-element's name until epic `repo-split` P3:  a stand-in, for spell-epic.
 * - spell-epic reads spell-app's main checkout through its `.spell-app` link:  its elements import `$/spell-solid`, and
 *   its `package.json` links this folder (`portal:`).  So this name has to work until spell-epic follows the rename
 *   (epic `repo-split` T6).  Delete this folder then.
 * - It only re-exports `$/spell-element`, so a page still has ONE copy of the element bases.
 * - Not a workspace, and nothing in spell-app imports it.
 */
export * from "$/spell-element"
