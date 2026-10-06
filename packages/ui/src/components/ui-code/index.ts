/**
 * Barrel for code -- also the `code` lib entry (`@spell-app/ui/ui-code`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-code>`, plus `<ui-loader>` and `<ui-message>` (its loading and error looks);
 *   registers the `spell` language with `UI.code` once the runtime is in (`SpellLanguage`).
 * - NOTE: highlight.js is NOT in this chunk:  `CodeEngine` loads on the first highlight;  nor is spell's
 *   highlighter (`src/languages/spell.<lang>.js`), loaded the first time `language="spell"` shows.
 */

import { UI } from "$/ui/core"
import { UICode } from "./UICode"
import { UICodeHost } from "./UICodeHost"
import { CodeHighlighter } from "./CodeHighlighter"
import { CodeLines } from "./CodeLines"
import { SpellLanguage } from "./SpellLanguage"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UICode.define()
void UI.load().then(() => SpellLanguage.register())

export { UICode, UICodeHost, CodeHighlighter, CodeLines, SpellLanguage }
