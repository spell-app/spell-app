/**
 * The code family:  defines `<ui-code>` and exports its component, `UICode`, its DOM element class,
 * `DOMCodeElement`, and its helpers (`CodeHighlighter`, `CodeLines`, `SpellLanguage`).
 * - SIDE EFFECTS:  importing it defines the tag, and `<ui-loader>` and `<ui-message>` (its loading and error looks);
 *   once the runtime is in, it registers the `spell` language with `UI.code` (`SpellLanguage`).
 * - Also the library's `@spell-app/ui/ui-code` entry (its size is in `docs/report.md`).
 * - highlight.js is NOT in this chunk:  `CodeEngine` loads on the first highlight.
 *   Nor is spell's highlighter (`src/languages/spell.<lang>.js`), loaded the first time `language="spell"` shows.
 */

import { UI } from "$/ui/core"
import { DOMCodeElement, UICode } from "./UICode"
import { CodeHighlighter } from "./CodeHighlighter"
import { CodeLines } from "./CodeLines"
import { SpellLanguage } from "./SpellLanguage"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UICode.define()
void UI.load().then(() => SpellLanguage.register())

export { UICode, DOMCodeElement, CodeHighlighter, CodeLines, SpellLanguage }
