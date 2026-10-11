import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `UpdateSummary`
 * An `<epic-update>`'s `summary`, when nobody gave one:  the first sentence of what changed, trimmed to one line.
 * - the text's first sentence:  up to its first `.`, `!` or `?` followed by a space (or the end);  a final `.`
 *   dropped, since the title reads `Update: <summary>`
 * - longer than `MAX_LENGTH`:  cut at the last word that fits, with `…`
 * - used by `updated` without `--summary` (`PlanDoc.addPhaseUpdate()`) and by the migration of older docs
 *   (`UpdatesAsEpicUpdate`)
 * - STATIC, pure:  reads text, or a node's text content
 ****************/
export class UpdateSummary {
  /** The longest summary, in characters, `…` included. */
  static readonly MAX_LENGTH = 90

  /** The summary of `nodes` (what changed, as the update's children):  their text's first sentence, trimmed. */
  static of(nodes: Iterable<Node>): string {
    return UpdateSummary.fromText(Array.from(nodes, (node) => ` ${node.textContent ?? ""} `).join(""))
  }

  /** The summary of `text`:  its first sentence, trimmed;  `""` for none. */
  static fromText(text: string): string {
    const squeezed = PlanMarkup.squeeze(text)
    const sentence = SENTENCE.exec(squeezed)?.[1] ?? squeezed
    const plain = sentence.replace(/\.$/, "")
    if (plain.length <= UpdateSummary.MAX_LENGTH) return plain
    const cut = plain.slice(0, UpdateSummary.MAX_LENGTH)
    const words = cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,;:(-]+$/, "")
    return `${words}…`
  }
}

/** A text's first sentence:  up to a `.`, `!` or `?` that ends a word, then a space or the end. */
const SENTENCE = /^(.+?[.!?])(?=\s|$)/
