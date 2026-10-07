/**
 * MOVED:  a plan doc in parts (a skeleton plus `parts/<id>.htm`) is `PlanParts`, `$/epics/tool/PlanParts` (epic
 * `epic-components`, P7:  the plan-doc tool is TypeScript in `packages/epics`).  This forwards, for old imports.
 * - NOTE:  the API is the class's statics now (`PlanParts.partFile()` ...), not the old free functions;  splitting
 *   and assembling a doc in the new markup is `$/epics/convert` `EpicParts` (P8)
 */
export { PART_EXT, PARTS_DIR, PlanParts } from "$/epics/tool/PlanParts"
