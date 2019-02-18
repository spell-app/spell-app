//
//  Matching functions for using during parsing.
//

export function matchLiteral(literal, token) {
  return literal === token;
}

export function indexOfLiteral(literal, tokens, start, end) {
  while (start < end) {
    if (matchLiteral(literal, tokens[start])) return start;
    start++;
  }
  return -1;
}

//
//  Matching an array of literal strings.
//  Returns numeric index where match was found.
//  Returns `false` if no found.
//
export function matchLiteralsAtStart(literals, tokens, start = 0, end = tokens.length) {
  const length = literals.length;
  if (start + length > end) return false;

  // Quick exit if no match at start
  if (!matchLiteral(literals[0], tokens[start])) return false;

  // if more than one, make sure all the rest match
  if (length > 1) {
    for (let i = 1; i < length; i++) {
      if (!matchLiteral(literals[i], tokens[start + i])) return false;
    }
  }
  return start;
}

export function matchLiteralsAnywhere(literals, tokens, start = 0, end = tokens.length) {
  // otherwise check anywhere in the string
  const first = literals[0];
  let index = indexOfLiteral(first, tokens, start, end);
  while (index !== -1) {
    if (matchLiteralsAtStart(literals, tokens, index, end) !== false) return index;
    // keep going from here if possible, making sure we advance
    index = indexOfLiteral(first, tokens, index + 1, end);
  }
  return false;
}


//
//  Matching a single regex pattern, including blacklist support.
//  Returns numeric index where match was found.
//  Returns `false` if no found.
//
export function matchPatternAtStart(pattern, blacklist, tokens, start = 0, end = tokens.length) {
  if (start >= end) return false;
  if (!pattern.test(tokens[start])) return false;
  if (blacklist && blacklist[tokens[start]]) return false;
  return start;
}

export function matchPatternAnywhere(pattern, blacklist, tokens, start = 0, end = tokens.length) {
  for (var index = start; index < end; index++) {
    const result = matchPatternAtStart(pattern, blacklist, tokens, index, end);
    if (result !== false) return result;
  }
  return false;
}


//
//  Matching a particular token type.
//  Returns numeric index where match was found.
//  Returns `false` if no found.
//
export function matchTokenTypeAtStart(type, tokens, start = 0, end = tokens.length) {
  if (start < end && tokens[start] instanceof type) return start;
  return false;
}

export function matchTokenTypeAnywhere(type, tokens, start = 0, end = tokens.length) {
  for (var index = start; index < end; index++) {
    const result = matchTokenTypeAtStart(type, tokens, index, end);
    if (result !== false) return result;
  }
  return false;
}
