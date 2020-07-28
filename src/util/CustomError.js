import global from "global"
/**
 * Generic `CustomError` class you can subclass which sets stack trace up property, etc.
 * You can pass in any properties you like, but it can be helpful to see:
 * - `messsage`   Required: single error message string or array of strings.
 * - `context`    Context in which the error happened, e.g. an instance.
 * - `activity`   Name of the method or action which failed.
 * - `params`     Any relevant parameters for the action.
 */
export class CustomError extends Error {
  constructor(props = {}, startStackAt) {
    super()
    if (typeof props === "string") this.message = props
    else Object.assign(this, props)

    // Hook stack trace up to where error was actually called, rather than this function.
    // NOTE: This is v8-specific!
    if (Error.captureStackTrace) Error.captureStackTrace(this, startStackAt || this.constructor)

    // Restore prototype chain to make stack traces work out ???
    // See: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // TODO: WTF does this actually do?
    // TODO: Which platforms need this???
    Object.setPrototypeOf(this, new.target.prototype)
  }

  // Make `error.name` reflect constructor name.
  get name() {
    return this.constructor.name
  }

  /** Return `header` for this error, e.g. for `<ErrorDisplay>`. */
  get header() {
    const { name, activity } = this
    if (activity) return `${name} ${activity}`
    return name
  }
}

/** UI error -- something the user tried to do went wrong. */
export class UIError extends CustomError {
  get name() {
    return "Error"
  }
}

// DEBUG
global.CustomError = CustomError
