// Result of a successful parser `rule.parse()`.
// - `match.rule` (Rule, required) is the rule that was matched.
// - `match.matched` (string or [Match], optional) actual value matched,
//    either as a string or as an array of Matches
export default class match {
  constructor(props) {
    Object.assign(this, props);
  }

  // Syntactic sugar to easily get `results` of the match for sequences, etc.
  get results() { return this.rule.getResults?.(this) }

  // Syntatic sugar to compile the output of the match.
  compile() { return this.rule.compile(this) }

  // "name" for this match
  // TODO: this is too much, figure out what we're actually using here...
  get name() {
    return this.argument || this.group || this.rule.argument || this.rule.group || this.rule.name;
  }

  // Should we promote the match?
  get promote() {
    return this._promote || this.rule.promote;
  }
  set promote(value) { this._promote = value }
}
