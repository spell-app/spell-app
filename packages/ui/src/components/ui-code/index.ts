/**
 * Barrel for code -- also the `code` lib entry (`@spell-app/ui/ui-code`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-code>`, plus `<ui-loader>` and `<ui-message>` (its loading and error looks).
 * - NOTE: highlight.js is NOT in this chunk:  `CodeEngine` loads on the first highlight.
 */

import { UICode } from "./UICode"
import { UICodeHost } from "./UICodeHost"
import { CodeHighlighter } from "./CodeHighlighter"
import { CodeLines } from "./CodeLines"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UICode.define()

export { UICode, UICodeHost, CodeHighlighter, CodeLines }
