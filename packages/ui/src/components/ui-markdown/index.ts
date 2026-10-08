/**
 * The markdown family:  defines `<ui-markdown>` and exports its component, `UIMarkdown`,
 * its DOM element class, `DOMMarkdownElement`, and `MarkdownRenderer`.
 * - SIDE EFFECT:  importing it defines the tag, and `<ui-code>` (its code blocks),
 *   `<ui-loader>` and `<ui-message>` (its loading and error looks).
 * - Also the library's `@spell-app/ui/ui-markdown` entry (its size is in `docs/report.md`).
 * - marked and DOMPurify are NOT in this chunk:  `MarkdownEngine` loads on the first render,
 *   DOMPurify (`MarkdownSanitizer`) only for `sanitized`.
 */

import { DOMMarkdownElement, UIMarkdown } from "./UIMarkdown"
import { MarkdownRenderer } from "./MarkdownRenderer"

import "$/ui/components/ui-code"
import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UIMarkdown.define()

export { UIMarkdown, DOMMarkdownElement, MarkdownRenderer }
