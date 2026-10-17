/**
 * The types of the code family that the component and its highlighter (`CodeHighlighter`, `CodeEngine`) share.
 * - Types only:  nothing here runs.
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
