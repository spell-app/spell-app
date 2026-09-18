//
//  ## Shared types and exported helpers for app UI components.
//

////////////////
// ## Editor selection
////////////////

/** Cursor/scroll selection remembered per-file, as stored/restored via `store.lastSelectionForFile()`. */
export type EditorSelection = {
  scroll?: EditorScrollInfo
  anchor?: EditorPosition
  head?: EditorPosition
}

/**
 * Scroll state tracked alongside a cursor/scroll `EditorSelection`.
 * - Every measurement is required: `onInputCursor()` fills them all in from CodeMirror at once.
 */
export type EditorScrollInfo = {
  event: "cursor" | "scroll"
  direction?: "up" | "down"
  percent: number
  max: number
  current: number
  total: number
  visible: number
}

/** CodeMirror-style `{ line, ch }` position, augmented with pixel/offset info. */
export type EditorPosition = {
  line: number
  ch: number
  top?: number
  offset?: number
}
