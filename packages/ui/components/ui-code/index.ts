/**
 * The code family:  defines `<ui-code>` and exports its component, `UICode`, its DOM element class,
 * `DOMCodeElement`, and its helpers (`CodeHighlighter`, `CodeLines`).
 * - SIDE EFFECTS:  importing it defines the tag, and `<ui-loader>` and `<ui-message>` (its loading and error looks).
 * - Also the library's `@spell-app/ui/ui-code` entry (its size is in `notes/report.md`).
 * - highlight.js is NOT in this chunk:  `CodeEngine` loads on the first highlight.
 * - A language of a page's own joins `UI.code` (`UI.code.register()`):
 *   spell's is the app's `<spell-code>` family, which Spell UI knows nothing of.
 */

import { DOMCodeElement, UICode } from "./UICode"
import { CodeHighlighter } from "./CodeHighlighter"
import { CodeLines } from "./CodeLines"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UICode.define()

export { UICode, DOMCodeElement, CodeHighlighter, CodeLines }
