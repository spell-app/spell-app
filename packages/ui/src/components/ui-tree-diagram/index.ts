/**
 * The tree diagram family:  defines `<ui-tree-diagram>` and exports its component, `UITreeDiagram`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-tree-diagram` entry (its size is in `docs/report.md`).
 * - `TreeLayout` (the pure layout) and `TreeData` (reading and checking a tree) are exported too,
 *   for a page that wants the numbers alone;  `TreeDiagramNode` is the data contract.
 */

import { TreeData } from "./TreeData"
import { TreeLayout } from "./TreeLayout"
import { UITreeDiagram } from "./UITreeDiagram"

UITreeDiagram.define()

export { TreeData, TreeLayout, UITreeDiagram }
export type {
  TreeDiagramBox,
  TreeDiagramEdge,
  TreeDiagramLayout,
  TreeDiagramMetrics,
  TreeDiagramNode,
  TreeDiagramPoint,
  TreeDiagramSlot
} from "./UITreeDiagram.types"
