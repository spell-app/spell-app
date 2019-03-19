import { Match, Rule } from "./all.js";

// Recursively find balanced instances of `start` and `end`,
// then split by `delimiter` and apply `rule` to each, returning an array of matches.
// If you provide a `prefix`, we'll look for that after `start`.
//
// `start` (required) is the start token string
// `end` (required) is the end token string
// `rule` (required) is the middle bit, which is probably a sequence
// `delimiter` (optional) if provided, we'll split on this string and apply `rule` to each item inside
// `prefix` (optional) optional array of rules to match inside the FIRST item
//
// If nested start/end blocks are found, WHAT WILL HAPPEN???
Rule.NestedSplit = class nesting extends Rule {
  parse(scope, tokens) {

    const end = this.findNestedEnd(scope, tokens);
    if (end === undefined) return;

    const tokenGroups = this.splitTokens(scope, tokens.slice(1, end));
    if (tokenGroups === undefined) return;

    let prefix;
    const groups = [];
    for (let i = 0, tokenGroup; tokenGroup = tokenGroups[i]; i++) {
      // For the first item only, match the `prefix` rules if supplied
      if (i === 0 && this.prefix) {
        prefix = this.prefix.parse(scope, tokenGroup);
        if (!prefix && !prefix.optional) return undefined;
        if (prefix) tokenGroup = tokenGroup.slice(prefix.length);
      }
      const match = this.rule.parse(scope, tokenGroup);
      if (!match) return undefined;

      if (match.length !== tokenGroup.length) {
        return undefined;
      }
      groups.push(match);
    }
    return new Match({
      rule: this,
      prefix,
      groups,
      length: end + 1,
      scope
    });
  }

  gatherResults(scope, match) {
    const { rule, prefix, groups } = match;
    const results = prefix && prefix.compile() || {};
    const name = rule.rule.argument || rule.rule.name;
    results[name] = groups.map(group => group.compile());
    return results;
  }

  // If no explcit compile method, return our `results` for someone else to consume.
  compile(scope, match) {
    return this.gatherResults(scope, match);
  }

  // If tokens starts with our `start` literal,
  //  find the index of the token which matches our `end` literal.
  // Returns `undefined` if not found or not balanced.
  findNestedEnd(scope, tokens, start = 0) {
    if (!this.start.testAtStart(scope, tokens, start)) return undefined;
    let nesting = 0;
    for (let end = start + 1, token; token = tokens[end]; end++) {
      if (this.start.testAtStart(scope, tokens, end)) {
        nesting++;
      }
      if (this.end.testAtStart(scope, tokens, end)) {
        if (nesting === 0) return end;
        nesting--;
      }
    }
    return undefined;
  }

  // If tokens starts with our `start` literal,
  //  find the index of the token which matches our `end` literal.
  // Returns `undefined` if not found or not balanced.
  splitTokens(scope, tokens) {
    const groups = [];
    let current = [];
    for (let i = 0, token; token = tokens[i]; i++) {
      // handle alternate marker
      if (this.delimiter.testAtStart(scope, tokens, i)) {
        groups.push(current);
        current = [];
        continue;
      }
      // handle nested start/emd
      if (this.start.testAtStart(scope, tokens, i)) {
        const end = this.findNestedEnd(scope, tokens, i);
        if (end) {
          current = current.concat(tokens.slice(i, end + 1));
          i = end;
          continue;
        }
      }
      current.push(token);
    }
    // Pick up the last list ONLY if it's not empty
    // This ensures we don't pick up an empty list for a delimiter at the end.
    if (current.length) groups.push(current);

    if (!groups.length) return undefined;
    return groups;
  }
}
