import DOMPurify from "dompurify"

import { SourceError } from "$/ui/runtime/runtime.types"

/****************
 * ### `MarkdownSanitizer`
 * DOMPurify, in `<ui-markdown>`'s `sanitized` chunk:  imported by `MarkdownRenderer.loadSanitizer()` on the first render
 * of a `sanitized` element, so a page that shows only its own markdown never loads it.
 * - Sanitizes in EVERY browser.  Why not the platform's `Element.setHTML()`:  by default it drops task-list
 *   checkboxes, images, heading ids and code-language classes, and it differs by browser (none in Safari).
 * - `SANITIZE_DOM` off:  it drops ids that shadow DOM properties (`id="elements"`, `id="forms"`), to stop DOM
 *   clobbering -- which can't happen here:  the markup lives in a shadow root, out of `document`'s named access.
 * - Fails CLOSED:  where DOMPurify can't sanitize (`isSupported` false), it throws a `SourceError` ("render") rather
 *   than hand back markup it didn't clean.
 * - NEVER a value import but DOMPurify and `SourceError`:  the docs bundler builds this file ALONE into a classic
 *   script (`MarkdownRenderer.sanitizerLoader`).
 * - Imports `SourceError` straight from `$/ui/runtime/runtime.types` (built into `core.js`), and USES it, as
 *   `MarkdownEngine` / `CodeEngine` do:  without it this chunk needed Rolldown's helpers (`keepNames`) without
 *   depending on core, and Rolldown split them into a `rolldown-runtime-<hash>.js` EVERY page loaded (epic
 *   `wwod-spell-ui`, I12;  `yarn measure`'s `runtimeChunks`).
 ****************/
export class MarkdownSanitizer {
  /** The one sanitizer. */
  static readonly instance = new MarkdownSanitizer()

  /** Custom elements `uiTags` keeps. */
  private static readonly UI_TAG = /^ui-[a-z-]+$/

  /** Event-handler attributes, never kept. */
  private static readonly HANDLER = /^on/i

  /**
   * `html`, sanitized, as a fragment of this document;  throws where DOMPurify can't sanitize.
   * - `uiTags`:  keep `ui-*` elements (spell's engine draws with them), with any attribute but an `on*` handler.
   */
  sanitize(html: string, uiTags: boolean): DocumentFragment {
    if (!DOMPurify.isSupported) throw new SourceError("render", "DOMPurify can't sanitize in this browser")
    return DOMPurify.sanitize(html, {
      RETURN_DOM_FRAGMENT: true,
      SANITIZE_DOM: false,
      ...(uiTags && {
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: MarkdownSanitizer.UI_TAG,
          attributeNameCheck: (name: string) => !MarkdownSanitizer.HANDLER.test(name),
          allowCustomizedBuiltInElements: false
        }
      })
    })
  }
}
