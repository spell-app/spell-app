/**
 * Types of the `ui-code` family that its element, its host and its highlighter share.
 * - Types only, at the bottom of the folder's imports:  nothing here runs.
 */

////////////////
// ## Highlighting
////////////////

/** What a highlight came to (`CodeHighlighter.highlight()`). */
export type Highlighted = {
  /** the code as HTML:  escaped text in `hljs-*` spans */
  html: string
  /** what it was coloured as;  `undefined` for plain text */
  language?: string
  /** guessed, not asked for */
  detected: boolean
}

////////////////
// ## Host and controller
////////////////

/** What the host (`UICodeHost`) asks of its controller (`UICode`). */
export type CodeController = {
  /** what auto-detection picked, when it ran */
  detectedLanguage(): string | undefined
}
