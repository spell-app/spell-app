// Error we'll throw for problems when parsing.
// Uses a specific type so we can check for it in tests.
export default function ParseError(...args) {
  Error.apply(this, args);
  if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
}
ParseError.prototype = new Error();
