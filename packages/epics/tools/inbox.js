/**
 * MOVED:  an epic page's review inbox (`<name>.inbox.json5`) is `ReviewInbox`, `$/epics/tool/ReviewInbox` (epic
 * `epic-components`, P7:  the `epic` tool is TypeScript in `packages/epics`).  This forwards, for old imports.
 * - NOTE:  the API is the class's now (`ReviewInbox.update(file, (inbox) => inbox.setMark(...))` ...), not the old
 *   free functions over an inbox object
 */
export * from "$/epics/tool/ReviewInbox"
