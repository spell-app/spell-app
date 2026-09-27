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
 * - Every measurement is required: `onInputCursor()` fills them all in from CodeMirror at once.
 */
export type EditorScrollInfo = {
  /** Whether this update came from a cursor move (one-arg `onCursorActivity`) or a scroll (two-arg `onScroll`). */
  event: "cursor" | "scroll"
  /** Scroll direction since the last update, if `current` changed. */
  direction?: "up" | "down"
  /** `current / max`, rounded to 4 significant digits. */
  percent: number
  /** Maximum scroll offset, i.e. `total - visible`. */
  max: number
  /** Current scroll offset, from CodeMirror's `doc.scrollTop`. */
  current: number
  /** Total scrollable height, from CodeMirror's `doc.height`. */
  total: number
  /** Visible height, from CodeMirror's `display.lastWrapHeight`. */
  visible: number
}

/** CodeMirror-style `{ line, ch }` position, augmented with pixel/offset info. */
export type EditorPosition = {
  /** Zero-based line number. */
  line: number
  /** Character offset within `line`. */
  ch: number
  /** Pixel offset from top of editor, from CodeMirror's `cursorCoords()`. */
  top?: number
  /** Character offset into file contents -- only set for `SpellFile`/`SpellCSSFile`, not `SpellJSFile`. */
  offset?: number
}
