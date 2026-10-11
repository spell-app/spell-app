//
//  ## Types shared by the writers (`Writer`, `JSWriter`, `TreeWriter`).
//  - Runtime-light:  types only, so anything in the folder may import it.
//

/**
 * One box of a spell tree diagram:  what `P.TreeWriter` writes for each AST node.
 * - The same shape `@spell-app/ui`'s `<ui-tree-diagram>` draws (its `TreeDiagramNode`):  plain data, as JSON, so the
 *   parser and `ui` never import each other.
 */
export type TreeNode = {
  /** The box's text, e.g. `If`, `Variable number`, `Number 15`. */
  label: string
  /** A second, smaller line, e.g. the node's datatype `number`;  none when unknown. */
  detail?: string
  /** Its place in its parent, on the line from it, e.g. `condition`, `lhs`. */
  slot?: string
  /** Hover text:  the spell it came from, e.g. `the number divided by 15`. */
  title?: string
  /** Its children, left to right. */
  children?: TreeNode[]
}

/**
 * What a module imports from ONE module, by name -- see `ProgramWriter.importsHeader()`.
 * - e.g. `{ module: "@spell/core", names: ["spellCore", "Thing"] }`;
 *   `{ module: "@spell/project/@system:library:cards", names: ["Card as Playingcard", "Deck"] }`
 * - A name may say what it's called here:  `Card as Playingcard`.
 */
export type ModuleImport = {
  /** The module, as compiled spell names it:  `@spell/core`, or `@spell/project/<project id>`. */
  module: string
  /** What it imports from there, each `name` or `name as localName`. */
  names: string[]
}

/**
 * What a writer is told about the project it writes, besides its code -- see `Writer.forProject()`.
 * - From the project's `project.json`.
 */
export type WriterOptions = {
  /**
   * Where the project's lists start counting:  `1`, spell's own (the default), or `0` (`"listsStartAt": 0`,
   * epic `python-target` P2).  Ordinal words don't follow it:  "the first card" is the first either way.
   */
  listsStartAt?: 0 | 1
}
