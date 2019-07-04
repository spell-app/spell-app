//////////
// Assertion primitives
// TODO: some way to control output
//////////

import spell from "."

// Assert that some `condition` is truthy:
//  - if truthy, return `true`
//  - if not truthy, calls `assert.failed(...message)` and return false
export function assert(condition, ...message) {
  if (spell.isTruthy(condition)) return true
  assert.failed(message)
  return false
}

// Called when an assertion fails.
// Default is to log a warning to the console, overide method if you want.
assert.failed(...message) {
  console.warn(...message)
}

// Assert that `thing` is "equal to" `otherThing` according to `spell.equals()`
assert.equals(thing, otherThing, ...message) {
  const condition = spell.equals(thing, otherThing)
  return assert(condition, ...message)
}

// Assert that `thing` is not null or undefined in `method`, with optional `message` bits
assert.defined(thing, method = "", ...message) {
  if (message.length === 0) message.push("expected non-null thing, got:", thing)
  return assert(thing != null, method, ...message)
}

// Assert that `thing` is array-like in `method`, with optional `message` bits
assert.isArrayLike(thing, method = "", ...message) {
  if (message.length === 0) message.push("expected an array-like thing, got: ", thing)
  return assert(thing != null, method, ...message)
}

