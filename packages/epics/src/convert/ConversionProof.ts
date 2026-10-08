import type { ProofReport, SetDifference, TextDifference, UnitDifference } from "./convert.types"

import { NewReading } from "./NewReading"
import { OldReading } from "./OldReading"

/****************
 * ### `ConversionProof`
 * Proves a conversion lost nothing:  the old doc and the new, both ASSEMBLED, read (`OldReading`, `NewReading`) and
 * compared.
 * - ids:  every id the old doc has, the new has
 * - links:  the same set of link targets (`href`), the ones the elements draw included
 * - text:  the same words in every unit (an item, a phase, a section ...);  a unit whose words only moved (an answer
 *   card after its question, not before) is listed as `reordered`, not as a loss
 * - Reports every difference, never hides one;  what's left out on purpose is listed (`excluded`, `EXCLUSIONS`).
 * - Knows nothing of the converter:  it reads the two documents.
 ****************/
export class ConversionProof {
  /** The old doc, read. */
  readonly before: OldReading
  /** The new doc, read. */
  readonly after: NewReading

  constructor({ before, after }: ConversionProofProps) {
    this.before = new OldReading(before)
    this.after = new NewReading(after)
  }

  /** The report:  every difference. */
  get report(): ProofReport {
    const ids = compareSets(this.before.ids, this.after.ids, this.before.excludedIds)
    const links = compareSets(this.before.links, this.after.links, this.before.excludedLinks)
    const text = this.compareText()
    const clean =
      [ids.missing, ids.added, links.missing, links.added].every((list) => !list.length) && !text.units.length
    return { ids, links, text, clean }
  }

  /** Every unit's words, old against new. */
  private compareText(): TextDifference {
    const units: UnitDifference[] = []
    const reordered: string[] = []
    const names = new Set([...this.before.units.keys(), ...this.after.units.keys()])
    for (const unit of names) {
      const old = this.before.units.get(unit) ?? []
      const now = this.after.units.get(unit) ?? []
      const { missing, added } = wordDifference(old, now)
      if (missing.length || added.length) units.push({ unit, missing, added })
      else if (old.join(" ") !== now.join(" ")) reordered.push(unit)
    }
    return { units, words: this.before.words.length, reordered }
  }
}

/** `ConversionProof`'s props:  the two documents, assembled. */
export type ConversionProofProps = {
  /** The doc in today's markup. */
  before: Document
  /** The doc in `<epic-*>` markup. */
  after: Document
}

/** `old` against `now`. */
function compareSets(old: Set<string>, now: Set<string>, excluded: string[]): SetDifference {
  return {
    missing: [...old].filter((it) => !now.has(it)),
    added: [...now].filter((it) => !old.has(it)),
    compared: old.size,
    excluded
  }
}

/** The words only `old` has, and only `now` has, counted (a word twice in `old`, once in `now`:  one missing). */
function wordDifference(old: string[], now: string[]): { missing: string[]; added: string[] } {
  const counts = new Map<string, number>()
  for (const word of now) counts.set(word, (counts.get(word) ?? 0) + 1)
  const missing: string[] = []
  for (const word of old) {
    const left = counts.get(word) ?? 0
    if (left) counts.set(word, left - 1)
    else missing.push(word)
  }
  const added: string[] = []
  for (const word of now) {
    const left = counts.get(word) ?? 0
    if (left) {
      added.push(word)
      counts.set(word, left - 1)
    }
  }
  return { missing, added }
}
