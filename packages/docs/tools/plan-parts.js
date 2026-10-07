/**
 * MOVED:  a plan doc in parts (a skeleton plus `parts/<id>.htm`) is `PlanParts`, `$/epics/tool/PlanParts` (epic
 * `epic-components`, P7:  the plan-doc tool is TypeScript in `packages/epics`).  This forwards, for old imports.
 * - NOTE:  the API is the class's now (`new PlanParts(document).split()`, `PlanParts.partFile()` ...), not the old
 *   free functions
 */
export { PART_EXT, PARTS_DIR, PlanParts } from "$/epics/tool/PlanParts"
