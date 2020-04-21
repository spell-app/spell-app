/** Generic `CustomError` class you can subclass which sets stack trace up property, etc. */
export class CustomError extends Error {
  constructor(...params) {
    super(...params)
    // Hook stack trace up to where error was actually called
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor)
    // Restore prototype chain to make stack traces work out
    Object.setPrototypeOf(this, new.target.prototype)
  }
  // Set `error.name` up to point to parent
  get name() {
    return this.constructor.name
  }
}
