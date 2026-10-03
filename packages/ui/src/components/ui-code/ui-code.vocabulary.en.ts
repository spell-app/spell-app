/**
 * Every name `<ui-code>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - The source pieces (`source`, `load`, `ui-load` ... `ui-error`, the loader / error parts, the states and texts)
 *   are shared with `<ui-include>` and `<ui-markdown>`:  `UIT.SOURCE_*`, which `SourceElement` reads.
 * - Class words:  `line-numbers` => `numbered`, `wrap` => `wrapping` (`ui numbered wrapping code`).
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `<ui-code>`
 * A block of code, coloured by language:  inline text or a `source` file, in `<pre><code>`.
 ****************/
export const codeVocabulary = {
  tag: "ui-code",
  topics: ["text", "typography", "data display"],
  aka: ["code block", "syntax highlighting", "highlighter", "pre", "snippet", "source code", "listing"],
  skeleton: { parts: [{ shape: "paragraph", lines: 5 }] },
  noun: "code",
  description:
    "Code shows a block of source code coloured by its language, from the element's own text or a file on this site.",
  attributes: [
    ...UIT.SOURCE_ATTRIBUTES,
    {
      name: "language",
      kind: "string",
      description:
        "Language to colour it as:  a highlight.js name or alias (`ts`, `html`, `css`, `json`, `bash` ...), `spell` " +
        "(~== `spell/en`) or `spell/<lang>` for a translation, or `text` for none.  Absent:  guessed from the code."
    },
    {
      name: "line-numbers",
      kind: "keyOnly",
      key: "numbered",
      property: "lineNumbers",
      description: "Number the lines, in a gutter that wrapped lines don't run under."
    },
    { name: "start", kind: "number", default: 1, description: "Number of the first line, with `line-numbers`." },
    {
      name: "wrap",
      kind: "keyOnly",
      key: "wrapping",
      description: "Wrap long lines;  default:  they scroll sideways."
    },
    { name: "copy", kind: "boolean", description: "A button that copies the code." }
  ],
  events: [
    ...UIT.SOURCE_EVENTS,
    {
      name: "ui-highlight",
      detail: "{ language?: string, detected: boolean }",
      description:
        "Coloured:  `language` is what it was coloured as (`undefined`:  plain text), `detected` when it was guessed."
    },
    { name: "ui-copy", detail: "{ content: string }", description: "The copy button copied `content`." }
  ],
  slots: [],
  parts: [
    ...UIT.SOURCE_PARTS,
    { name: "box", description: "The box around the code and the copy button." },
    { name: "pre", description: "The `<pre>`." },
    { name: "code", description: "The `<code>`, holding one `.line` span per line." },
    { name: "copy", description: "The copy button." }
  ],
  states: [...UIT.SOURCE_STATES, { name: "copied", description: "The copy button just copied the code." }],
  texts: [
    ...UIT.SOURCE_TEXTS,
    { key: "codeCopy", text: "Copy", description: "The copy button." },
    { key: "codeCopied", text: "Copied", description: "The copy button, just after a copy." },
    { key: "codeLabel", text: "{language} code", description: "Accessible name of the code, by its language." },
    { key: "codeLabelPlain", text: "Code", description: "Accessible name of the code, language unknown." }
  ]
} as const satisfies ComponentVocabulary
