import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `UpdateSummary`
 * An `<epic-update>`'s `summary`, when nobody gave one:  the first sentence of what changed, trimmed to one line.
 * - the text's first sentence:  up to its first `.`, `!` or `?` followed by a space (or the end);  a final `.`
 *   dropped, since the title reads `Update: <summary>`
 * - a lead saying who or when (`From Owen's comment CM2 (2026-10-11):`, `Owen, 2026-10-11:`) dropped:  the text says
 *   that, and the update shows its date (Owen, 2026-10-11:  "Don't repeat e.g. From Owen's comment ...")
 * - longer than `MAX_WORDS`:  its first words, with `…` (Owen:  titles of 5-10 words;  pass `--summary` for a good one)
 * - used by `updated` without `--summary` (`PlanDoc.addPhaseUpdate()`) and by the migration of older docs
 *   (`UpdatesAsEpicUpdate`)
 * - STATIC, pure:  reads text, or a node's text content
 ****************/
export class UpdateSummary {
  /** The most words a summary keeps (Owen, 2026-10-11:  "5-10 words max"). */
  static readonly MAX_WORDS = 10

  /** The summary of `nodes` (what changed, as the update's children):  their text's first sentence, trimmed. */
  static of(nodes: Iterable<Node>): string {
    return UpdateSummary.fromText(Array.from(nodes, (node) => ` ${node.textContent ?? ""} `).join(""))
  }

  /** The summary of `text`:  its first sentence, trimmed;  `""` for none. */
  static fromText(text: string): string {
    const squeezed = PlanMarkup.squeeze(text)
    const sentence = SENTENCE.exec(squeezed)?.[1] ?? squeezed
    const plain = sentence.replace(/\.$/, "").replace(WHO_OR_WHEN, "")
    const words = plain.split(" ")
    if (words.length <= UpdateSummary.MAX_WORDS) return plain
    return `${words
      .slice(0, UpdateSummary.MAX_WORDS)
      .join(" ")
      .replace(/[\s,;:(-]+$/, "")}…`
  }
}

/**
 * A lead saying who asked, or when, up to its colon:  `From Owen's comment CM3 (2026-10-11): `, `Owen, 2026-10-11: `,
 * `Bedtime, 2026-10-11 (Owen): `, `Re-aimed by Owen's revisit note on J3 (2026-10-11): `
 */
const WHO_OR_WHEN = /^[^:]{0,80}?(?:\bOwen\b|\d{4}-\d\d-\d\d)[^:]{0,40}:\s+/

/** A text's first sentence:  up to a `.`, `!` or `?` that ends a word, then a space or the end. */
const SENTENCE = /^(.+?[.!?])(?=\s|$)/
