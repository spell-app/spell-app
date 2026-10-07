/**
 * Entry of the PRE-COMPILED markdown engine `@spell-app/ui` ships:  `yarn gen:markdown` (in `packages/ui`) bundles
 * this file with the parser into `packages/ui/src/components/ui-markdown/md.bundle.js`.
 * - Why a bundle:  `ui` never imports `$/markdown`'s SOURCE (root `AGENTS.md`);  like spell's highlighter, this
 *   generated file is the exception.
 * - The default export is all `ui` needs:  `render()` (`MD.render()`:  `{ html, headings }`).
 */

import { MD } from "$/markdown"

export default {
  /** `text` rendered with `ui-*` elements (unless `ui: false`):  its HTML and heading outline. */
  render(text: string, options: MD.RenderOptions = {}) {
    const { html, headings } = MD.render(text, options)
    return { html, headings }
  }
}
