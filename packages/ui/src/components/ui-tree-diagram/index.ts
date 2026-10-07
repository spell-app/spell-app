/**
 * Barrel for the tree diagram -- also the `tree-diagram` lib entry (`@spell-app/ui/ui-tree-diagram`).
 * - SIDE EFFECT:  defines `<ui-tree-diagram>`.
 * - NOTE: `TreeLayout` (the pure layout) and `TreeData` (reading and checking a tree) are exported too, for a page
 *   that wants the numbers alone;  `TreeDiagramNode` is the data contract.
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
} from "./ui-tree-diagram.types"
