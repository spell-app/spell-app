// Error we'll throw for problems when parsing.
// Uses a specific type so we can check for it in tests.

export default class ParseError extends Error {
  constructor(...props) {
    super(...props)
    // Fix up stack trace to refer to throwing line
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
  }
}
