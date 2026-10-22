//
//  ## Shared types and exported helpers for app UI components.
//

// ## Editor selection

/** Cursor/scroll selection remembered per-file, as stored/restored via `editor.lastSelectionForFile()`. */
export type EditorSelection = {
  /** Scroll position/direction at the time of selection. */
  scroll?: EditorScrollInfo
  /** Selection start. */
  anchor?: EditorPosition
  /** Selection end -- same as `anchor` for a plain cursor (no range selected). */
  head?: EditorPosition
}

/**
 * Scroll state tracked alongside a cursor/scroll `EditorSelection`.
 * - Every measurement is required: `onInputCursor()` fills them all in from Monaco at once.
 */
export type EditorScrollInfo = {
  /** Whether this update came from a cursor move or a scroll. */
  event: "cursor" | "scroll"
  /** Scroll direction since the last update, if `current` changed. */
  direction?: "up" | "down"
  /** `current / max`, rounded to 4 significant digits. */
  percent: number
  /** Maximum scroll offset, i.e. `total - visible`. */
  max: number
  /** Current scroll offset, from Monaco's `getScrollTop()`. */
  current: number
  /** Total scrollable height, from Monaco's `getScrollHeight()`. */
  total: number
  /** Visible height, from Monaco's `getLayoutInfo().height`. */
  visible: number
}

/** Zero-based `{ line, ch }` position, augmented with pixel/offset info. */
export type EditorPosition = {
  /** Zero-based line number. */
  line: number
  /** Character offset within `line`. */
  ch: number
  /** Pixel offset from top of the text, from Monaco's `getTopForPosition()`. */
  top?: number
  /** Character offset into file contents.  Wins over `line` / `ch` when restoring a selection. */
  offset?: number
}

// ## Type Explorer

/**
 * What a `<TypeExplorer>` remembers between runs -- plain JSON, for whoever stores it, e.g. the VS Code runner's
 * `settings.json5`.
 */
export type TypeExplorerState = {
  /** `id` of the selected node. */
  selected?: string
  /** Ids of the open tree rows:  nodes, and each type's "Properties", "Actions" ... groups. */
  open?: string[]
  /** Titles of the details sections open, e.g. `Spell` -- the same for every node. */
  openSections?: string[]
  /** Order its lists are in.  Default:  `"document"`. */
  order?: ScopeOrder
}

/**
 * Order a `<TypeExplorer>` lists things in:
 * - `document`:  as they're declared, under markers for the headings they're under -- see `LSP.ScopeEntry.section`
 * - `alphabetical`:  by name, ignoring case -- a type's members under "Properties", "Actions" ...
 */
export type ScopeOrder = "document" | "alphabetical"

// ## Thing Explorer

/**
 * What a `<ThingExplorer>` remembers between runs -- plain JSON, like `TypeExplorerState`.
 * - Things are known by creation number, which a program making the same things in the same order keeps from
 *   run to run -- so what's selected survives a Restart.
 */
export type ThingExplorerState = {
  /** Key of the selected thing, e.g. `#12`, or `@all_piles` for a plain top-level list -- see `thingKey()`. */
  selected?: string
  /** Keys of the open tree rows:  `top` for "Top level", `all` for "All things", `type:Card` for each type. */
  open?: string[]
  /** Order its tree is in.  Default:  `"document"`. */
  order?: ThingOrder
}

/**
 * Order a `<ThingExplorer>` lists things in:
 * - `document`:  all of them, in the order they were made
 * - `type`:  under each type they are, their own and each it extends -- e.g. a foundation under `Pile` too
 */
export type ThingOrder = "document" | "type"
