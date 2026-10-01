import type { P } from "$/parser"

/**
 * Collects what a half-typed statement could go on with, while `collect()` parses it in "expecting" mode.
 * - Rules record here, where they run out of tokens, what they were waiting for -- see `Parser.expectedAfter()`:
 *   - `Sequence.parse()`:  the child it hadn't got to, and each optional one after it -- or, failing after a
 *     child ran out of tokens inside itself, that child, as `within`
 *   - `Repeat.parse()`:  another item (or delimiter), as a continuation -- it's satisfied already
 *   - `Choice.parse()`:  marks what its OTHER alternatives recorded as continuations, once one alternative
 *     matched every token, e.g. `x` is a whole expression, so `x +...` only extends it
 *   - `Sequence.test()` lets a rule that fits the tokens so far, but runs out, through to `parse()`
 * - Dynamic scope:  `current` is set ONLY while `collect()` runs.  NEVER state on rules, which stay frozen.
 * - NOTE: outside `collect()` every hook is one `Expectations.current` check, so normal parsing pays nothing.
 */
export class Expectations {
  /** Collector for the `collect()` under way, if any. */
  static current: Expectations | undefined

  /**
   * Run `parse` in expecting mode, and return what the rules it ran were waiting for -- see `results()`.
   * - Nests:  an inner `collect()` has its own collector, and puts back the outer one when it's done.
   */
  static collect(parse: () => unknown): P.Expectation[] {
    const outer = Expectations.current
    const collector = new Expectations()
    Expectations.current = collector
    try {
      parse()
    } finally {
      Expectations.current = outer
    }
    return collector.results()
  }

  /** Everything recorded so far, in order. */
  readonly records: P.Expectation[] = []
  /** How many `Sequence`s deep the parse is right now. */
  depth = 0
  /** What each `{subrule}` parsed to, and recorded, by scope + first token + token count + rule name. */
  #memo = new Map<P.Scope, Map<P.Token, Map<string, { match: P.Match | undefined; records: P.Expectation[] }>>>()

  /**
   * `rule` could come next -- the `index`th child of `sequence`, if it's in one.
   * - `within`:  NOT next, but partway through -- see `P.Expectation.within`.
   */
  expect(rule: P.Rule, sequence?: P.Sequence, index?: number, continues = false, within = false): void {
    this.records.push({ rule, sequence, index, depth: this.depth, continues, within })
  }

  /** Run `parse` one `Sequence` deeper. */
  nested<T>(parse: () => T): T {
    this.depth++
    try {
      return parse()
    } finally {
      this.depth--
    }
  }

  /**
   * `parse()` the rule `name` at the head of `tokens` -- or, if we have already, the same match again,
   *   re-recording what it recorded then.
   * - Why:  expecting mode can't rule out a rule that STARTS with a subrule, e.g. `{thing} is {value}`, as the
   *   subrule might take every token typed so far.  So every expression rule parses, and each re-parses the same
   *   subrules at the same places, over and over -- ~130x a normal parse, and seconds on a long line, without this.
   * - Keyed by scope, first token and token count:  `tokens` always runs to the end of what was typed, so those
   *   pin down the slice.  `depth` is kept relative, so a re-recording is at the depth we're at now.
   * - NOTE: the match is SHARED by everything asking again, and `Subrule.parse()` sets its `matchGroup` -- fine
   *   here, where matches are thrown away, NOT for normal parsing.
   */
  memoized(name: string, scope: P.Scope, tokens: P.Token[], parse: () => P.Match | undefined): P.Match | undefined {
    let byToken = this.#memo.get(scope)
    if (!byToken) this.#memo.set(scope, (byToken = new Map()))
    let byName = byToken.get(tokens[0]!)
    if (!byName) byToken.set(tokens[0]!, (byName = new Map()))
    const key = `${tokens.length}:${name}`
    const cached = byName.get(key)
    if (cached) {
      for (const record of cached.records) this.records.push({ ...record, depth: record.depth + this.depth })
      return cached.match
    }
    const from = this.records.length
    const match = parse()
    const records = this.records.slice(from).map((record) => ({ ...record, depth: record.depth - this.depth }))
    byName.set(key, { match, records })
    return match
  }

  /**
   * A `Choice` is done trying its `alternatives`, each with the `records` it added (`from` up to `to`).
   * - If one matched EVERY token, what the others were waiting for only extends a finished thing:
   *   those become continuations.  What the complete ones recorded stays as it was.
   */
  endChoice(alternatives: Array<{ from: number; to: number; complete: boolean }>): void {
    if (!alternatives.some((alternative) => alternative.complete)) return
    for (const { from, to, complete } of alternatives) {
      if (complete) continue
      for (let index = from; index < to; index++) this.records[index]!.continues = true
    }
  }

  /**
   * One expectation per place -- rule + sequence + index -- in the order first recorded, at its shallowest depth.
   * - A place recorded as needed ANYWHERE isn't a continuation.
   */
  results(): P.Expectation[] {
    const byPlace = new Map<string, P.Expectation>()
    const ids = new Map<object, number>()
    for (const record of this.records) {
      const key = [record.rule, record.sequence, record.index, record.within].map((it) => this.idOf(ids, it)).join(":")
      const existing = byPlace.get(key)
      if (!existing) byPlace.set(key, { ...record })
      else {
        existing.depth = Math.min(existing.depth, record.depth)
        existing.continues &&= record.continues
      }
    }
    return [...byPlace.values()]
  }

  /** Short id for `value` in `ids`:  objects by identity, anything else as itself. */
  private idOf(ids: Map<object, number>, value: unknown): string {
    if (typeof value !== "object" || value === null) return String(value)
    let id = ids.get(value)
    if (id === undefined) ids.set(value, (id = ids.size))
    return `#${id}`
  }
}
