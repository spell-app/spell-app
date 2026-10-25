import type { PageCell } from "./NotebookPageCells"

/**
 * The SEAM where epic-engine's shared page patch plugs into a notebook (epic `elemental-spell` P16, Step 4;
 * epic-engine P40, `PagePatch` in the kit's `spell/server/site/PagePatch`).
 * - P40's planner works over any keyed tree through an ADAPTER (each node's key, kind, attributes, text, children),
 *   and yields STEPS (text, attr, replace, remove, insert, move) for a RUNNER to apply.
 * - Here:  `ChunkTreeAdapter`, a notebook's cells as that tree, keyed by their place (`NotebookKeys`);  and
 *   `CellRunner`, the steps a change from outside the page (another tab, an agent) makes, cell by cell.
 * - TODO: P40:  hand `ChunkTreeAdapter` to `PagePatch`'s planner, and apply its steps with `CellRunner` under
 *   `PagePatch.SHARED`'s rules (never an open editor, `data-spell-editor`;  folds kept).  Until then `CellRunner.plan()`
 *   is this file's own diff by key:  a changed cell draws again, which is its section at most.
 */
export class ChunkTreeAdapter {
  constructor(
    /** the cells, in order */
    readonly cells: readonly PageCell[],
    /** each one's key */
    readonly keys: readonly string[]
  ) {}

  /** The tree's nodes:  each cell, its key, kind, attributes (its name) and text (its code). */
  get nodes(): PatchNode[] {
    return this.cells.map((cell, index) => ({
      key: this.keys[index]!,
      kind: cell.kind,
      attributes: cell.name === undefined ? ({} as Record<string, string>) : { name: cell.name },
      text: cell.code,
      children: []
    }))
  }
}

/** The steps that turn one notebook's cells into another's, as P40's runner takes them. */
export class CellRunner {
  /**
   * The steps from `before` to `after`, by key:  `remove`, `insert`, `replace` (a cell whose code changed) and
   * `move` (one in a new place).
   * - TODO: P40:  `PagePatch`'s planner, once the notebook's on it.
   */
  static plan(before: ChunkTreeAdapter, after: ChunkTreeAdapter): PatchStep[] {
    const old = new Map(before.nodes.map((node, index) => [node.key, { node, index }]))
    const steps: PatchStep[] = []
    const kept = new Set<string>()
    after.nodes.forEach((node, index) => {
      const was = old.get(node.key)
      if (!was) steps.push({ kind: "insert", key: node.key, at: index })
      else {
        kept.add(node.key)
        if (was.node.text !== node.text) steps.push({ kind: "replace", key: node.key, at: index })
        else if (was.index !== index) steps.push({ kind: "move", key: node.key, at: index })
      }
    })
    for (const node of before.nodes) if (!kept.has(node.key)) steps.push({ kind: "remove", key: node.key })
    return steps
  }
}

/** A node of the tree P40's planner reads. */
export type PatchNode = {
  /** what keeps its place */
  key: string
  /** what it is */
  kind: string
  /** its attributes */
  attributes: Record<string, string>
  /** its text */
  text: string
  /** what's inside it */
  children: PatchNode[]
}

/** One step of a patch, by the key of the cell it changes. */
export type PatchStep = {
  /** what it does */
  kind: "insert" | "remove" | "replace" | "move"
  /** the cell's key */
  key: string
  /** where it goes, among the new cells */
  at?: number
}
