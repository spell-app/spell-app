// Import directly:  the barrel brings the site header and the section editor too
import { PagePatch, TEXT_KIND, type PatchStep, type PatchTree } from "spell/server/site/PagePatch"

import type { PageCell } from "./NotebookPageCells"

/**
 * A change to a notebook's file from OUTSIDE its page (another tab, an agent, a text editor), planned by epic-engine's
 * shared page patch (`PagePatch`, P40) and run cell by cell (epic `elemental-spell` P16, Step 4).
 * - `ChunkTreeAdapter`:  a notebook's cells as the keyed tree P40's planner reads:  the notebook, then each cell by its
 *   key (`NotebookKeys`), its kind, its name and its code (one text node).
 * - `CellRunner`:  plans the steps from the cells as they were to the cells as the file has them now
 *   (`PagePatch.plan()`), and says what each step does to the page:  which cells draw again, which come and go.
 * - The shared rules hold (`PagePatch.SHARED`):  an open editor is never replaced;  and the cell being typed in keeps
 *   its text, the change to it held back with a "Changed elsewhere" note (`fixed`).
 * - Plain TypeScript:  `NotebookController.outsideChange()` runs it;  its tests check it in node.
 */
export class ChunkTreeAdapter {
  constructor(
    /** the cells, in order */
    readonly cells: readonly PageCell[],
    /** each one's key */
    readonly keys: readonly string[]
  ) {}

  /** The tree's root:  the notebook, its children the cells. */
  get root(): ChunkNode {
    return {
      kind: "notebook",
      children: this.cells.map((cell, index) => ({
        key: this.keys[index]!,
        kind: cell.kind,
        attributes: cell.name === undefined ? [] : [["name", cell.name] as const],
        children: [{ kind: TEXT_KIND, text: cell.code, children: [] }]
      }))
    }
  }

  /** How P40's planner reads a `ChunkNode`. */
  static readonly tree: PatchTree<ChunkNode> = {
    key: (node) => node.key,
    kind: (node) => node.kind,
    attributes: (node) => node.attributes ?? [],
    text: (node) => node.text ?? "",
    children: (node) => node.children
  }
}

/** The steps a change from outside makes to a notebook's page, and what each one means for its cells. */
export class CellRunner {
  /** The steps from cells `before` to cells `after`:  `PagePatch.plan()` over their chunk trees. */
  static plan(before: ChunkTreeAdapter, after: ChunkTreeAdapter): PatchStep<ChunkNode>[] {
    return PagePatch.plan(before.root, after.root, ChunkTreeAdapter.tree)
  }

  /**
   * What `steps` do to the page's cells, by key.
   * - `changed`:  a cell whose code or name is new:  it draws again (a `text`, `attribute` or `replace` step)
   * - `added`, `removed`, `moved`:  cells that come, go or move:  the page's list follows the keys, nothing draws again
   * - `held`:  a changed cell in `fixed` (the one being typed in):  its change held back, its text kept
   */
  static run(steps: readonly PatchStep<ChunkNode>[], fixed: ReadonlySet<string>): CellRun {
    const run: CellRun = { changed: [], added: [], removed: [], moved: [], held: [] }
    for (const step of steps) {
      if (step.op === "insert") {
        if (step.node.key) run.added.push(step.node.key)
        continue
      }
      const key = keyOf(step.target)
      if (!key) continue
      if (step.op === "remove") run.removed.push(key)
      else if (step.op === "move") run.moved.push(key)
      else if (fixed.has(key)) run.held.push(key)
      else if (!run.changed.includes(key)) run.changed.push(key)
    }
    return run
  }
}

/** The cell an address names, from its leading `#key`:  `#cell-3/text()[1]` => `cell-3`. */
function keyOf(address: string): string | undefined {
  const head = /^#([^/]+)/.exec(address)?.[1]
  return head === undefined ? undefined : decodeURIComponent(head)
}

/** A node of a notebook's chunk tree:  the notebook, a cell, or a cell's code. */
export type ChunkNode = {
  /** a cell's key */
  key?: string
  /** `notebook`, a cell's kind, or a text's (`TEXT_KIND`) */
  kind: string
  /** a cell's name */
  attributes?: ReadonlyArray<readonly [string, string]>
  /** a text's:  a cell's code */
  text?: string
  /** what's inside it */
  children: ChunkNode[]
}

/** What `CellRunner.run()` says a change does, by cell key. */
export type CellRun = {
  /** cells whose code or name changed:  they draw again */
  changed: string[]
  /** new cells */
  added: string[]
  /** cells gone */
  removed: string[]
  /** cells in a new place */
  moved: string[]
  /** changed cells held back:  the one being typed in */
  held: string[]
}
