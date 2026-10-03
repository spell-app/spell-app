/**
 * Barrel for markdown -- also the `markdown` lib entry (`@spell-app/ui/ui-markdown`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-markdown>`, plus `<ui-code>` (its code blocks), `<ui-loader>` and `<ui-message>` (its
 *   loading and error looks).
 * - NOTE: marked and DOMPurify are NOT in this chunk:  `MarkdownEngine` loads on the first render.
 */

import { UIMarkdown } from "./UIMarkdown"
import { UIMarkdownHost } from "./UIMarkdownHost"
import { MarkdownRenderer } from "./MarkdownRenderer"

import "$/ui/components/ui-code"
import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UIMarkdown.define()

export { UIMarkdown, UIMarkdownHost, MarkdownRenderer }
