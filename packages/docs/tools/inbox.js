/**
 * MOVED:  a plan doc's review inbox (`<name>.inbox.json`) is `ReviewInbox`, `$/epics/tool/ReviewInbox` (epic
 * `epic-components`, P7:  the plan-doc tool is TypeScript in `packages/epics`).  This forwards, for old imports.
 * - NOTE:  the API is the class's now (`ReviewInbox.update(file, (inbox) => inbox.setMark(...))` ...), not the old
 *   free functions over an inbox object
 */
export * from "$/epics/tool/ReviewInbox"
