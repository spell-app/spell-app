/**
 * Every name `<ui-markdown>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The source pieces (`source`, `load`, `ui-load` ... `ui-error`, the loader / error parts, the states and texts)
 *   are shared with `<ui-include>` and `<ui-code>`:  `UIT.SOURCE_*`, which `SourceElement` reads.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `<ui-markdown>`
 * GitHub-flavoured markdown, rendered:  the element's own text or a `source` file, its code blocks as `<ui-code>`;
 * `sanitized` runs it through DOMPurify, `editable` adds Write / Preview tabs.
 ****************/
export const markdownVocabulary = {
  tag: "ui-markdown",
  topics: ["text", "typography", "data display"],
  aka: ["markdown", "md", "gfm", "readme", "rich text", "prose"],
  skeleton: { parts: [{ shape: "header" }, { shape: "paragraph", lines: 4 }] },
  noun: "markdown",
  description:
    "Markdown renders GitHub-flavoured markdown -- tables, task lists, code blocks -- from the element's own text or a file on this site.",
  attributes: [
    ...UIT.SOURCE_ATTRIBUTES,
    { name: "size", kind: "size", description: "Text size, as Fomantic's sizes;  default `medium`." },
    {
      name: "breaks",
      kind: "boolean",
      description: "A single newline is a line break, as in GitHub comments;  default off, as in GitHub files."
    },
    {
      name: "heading-offset",
      kind: "number",
      property: "headingLevelOffset",
      default: 0,
      description:
        "Levels to shift headings by, e.g. `1`:  `#` becomes `<h2>`, to sit under the page's own heading.  Property " +
        "`headingLevelOffset`:  `headingOffset` is WebKit's native `headingoffset`."
    },
    {
      name: "skip-title",
      kind: "boolean",
      description:
        "Drop the text's leading `#` title (an `h1` first thing in the text), e.g. when the page shows its own " +
        "headline above a README.  The text itself is unchanged:  `content`, `save()` and the editor keep it."
    },
    {
      name: "editable",
      kind: "boolean",
      description:
        "Write / Preview tabs:  a text box for the markdown, and its preview, drawn with `ui-*` elements by spell's " +
        "markdown engine (`@spell-app/markdown`, its own lazy chunk).  Each edit is a `ui-change`;  `save()` writes it."
    },
    {
      name: "sanitized",
      kind: "boolean",
      description:
        "Sanitize the rendered markup with DOMPurify (its own lazy chunk, loaded only then):  no scripts, event " +
        "handlers or `javascript:` links.  Set it for text you didn't write;  without it, raw HTML is kept as written."
    }
  ],
  events: [
    ...UIT.SOURCE_EVENTS,
    {
      name: "ui-render",
      detail: "{ headings: { level: number, text: string, id: string }[] }",
      description:
        "Rendered;  `headings` (also the `headings` property) lists its headings, e.g. for a table of contents."
    }
  ],
  slots: [],
  parts: [
    ...UIT.SOURCE_PARTS,
    { name: "body", description: "The `<article>` holding the rendered markdown." },
    { name: "tabs", description: "`editable`:  the Write / Preview tab list." },
    { name: "tab", description: "`editable`:  each tab button." },
    { name: "editor", description: "`editable`:  the `<textarea>` holding the markdown." }
  ],
  states: [...UIT.SOURCE_STATES],
  texts: [
    ...UIT.SOURCE_TEXTS,
    { key: "write", text: "Write", description: "`editable`:  the editing tab." },
    { key: "preview", text: "Preview", description: "`editable`:  the preview tab." },
    { key: "editor", text: "Markdown", description: "`editable`:  accessible name of the text box." }
  ]
} as const satisfies E.ComponentVocabulary
