/////////////////////////////////////
//
//  Add console logging methods to an arbitrary object.
//
//  Installs the following properties/methods:
//  - add `object.DEBUG_LEVEL` flag whose initial value is `debugLevel`.
//  - add `object.setDebugLevel(debugLevel)` (you can pass DEBUG constant, "WARN", 'info', etc)
//  - add `object.debug(...message)`
//  - add `object.info(...message)`
//  - add `object.warn(...message)`
//  - add `object.error(...message)`
//  - add `object.assert(condition, message)`
//
//  Calling the methods preserves the line number and stack trace on the right of the console.
//
//  In Chrome, this colorizes the entire line according to the `DebugColors` below.
//  In Firefox/Safari.etc, it only colorizes the prefix.
//  NOTE: not tested in IE!!
//
//  Example: To make logger with no prefix you can call in any context:
//      const logger = addDebugMethods()
//      logger.debug("not important")     => <no output, default level is WARN and above>
//      logger.warn("uh oh!")             => `uh oh!`
//      ...
//      logger.setDebugLevel(DEBUG)                         <= change log level
//      logger.debug("something else")    => `something else`
//
//
//  Example: To make logger with a prefix you can call in any context:
//      const logger = addDebugMethods({}, "my-logger")
//      logger.debug("not important")     => <no output, default level is WARN and above>
//      logger.warn("uh oh!")             => `my-logger: uh oh!`
//      ...
//      logger.setDebugLevel(DEBUG)                         <= change log level
//      logger.debug("something else")    => `my-logger: something else`
//
//
//  Example: To add to a class or singleton
//      class Foo extends Bar {
//        static someMethod() {
//          Foo.debug("not so important");
//          ...
//          Foo.warn("dag-nabbit!");
//        }
//      }
//      addDebugMethods("Foo", Foo, "WARN")                 <== add to the class
//      ...
//      Foo.someMethod() => `Foo: dag-nabbit!`
//      ...
//      Foo.setDebugLevel("DBEUG")
//      Foo.someMethod() => `Foo: not so important`
//                       => `Foo: dag-nabbit!`
//
//  Example: To add under a single prefix to all instances of a class, add to the prototype:
//      class Foo extends Bar {
//        someMethod() {
//          this.debug("uh oh!");
//        }
//      }
//      addDebugMethods("foo", Foo.prototype, "WARN");      <== add to the prototype!
//      ...
//      const foo = new Foo("my-foo-instance");
//      foo.someMethod() => <no output>
//      ...
//      foo.setDebugLevel("DEBUG")                          <== change level for this instance only
//      foo.someMethod() => `foo: uh oh!`
//      ...
//      Foo.prototype.setDebugLevel("DEBUG")                <== change level for all instances
//                                                              IFF they haven't been set explicitly
//
//  Example: To add under a unique prefix for each instance of a class:
//      class Foo extends Bar {
//        constructor(name) {
//          addDebugMethods(name, this, "WARN");            <== add to this instance
//        }
//        someMethod() {
//          this.debug("uh oh!");
//        }
//      }
//      const foo = new Foo("my-foo-instance");
//      foo.someMethod() => <no output>
//      ...
//      foo.setDebugLevel("DEBUG");                         <== change level for this instance
//      foo.someMethod() => "my-foo-instance: uh oh!"
//
/////////////////////////////////////

import { isNode } from "browser-or-node";

//////////////////////////////
//
//  Debug states
//
//////////////////////////////
export const DebugLevel = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
}

// Add debug methods to `object`
export function addDebugMethods(object = {}, prefix, level = "WARN", color = "#999") {
  // Set initial `DEBUG_LEVEL` level
  // NOTE: if already set on the object, don't override.
  if (!("DEBUG_LEVEL" in object))
    object.DEBUG_LEVEL = normalizeDebugLevel(level);

  // Set `setDebugLevel` method
  Object.defineProperty(object, "setDebugLevel", {
    configurable: true,
    value: function(level) {
      level = normalizeDebugLevel(level);
      // Don't override if we're already at the same level
      // This lets prototype/instance semantics work cleanly.
      if (level === this.DEBUG_LEVEL && this.debug) return;

      this.DEBUG_LEVEL = level;
      // Add normal debuggers.
      // NOTE: we do this every time debug level is set to preserve stack trace.
      this.debug = makeLogMethod(level, DebugLevel.DEBUG, prefix, "log", color);
      this.info = makeLogMethod(level, DebugLevel.INFO, prefix, "info", color);
      this.warn = makeLogMethod(level, DebugLevel.WARN, prefix, "warn", color);
      this.error = makeLogMethod(level, DebugLevel.ERROR, prefix, "error", color);
      this.group = makeLogMethod(level, DebugLevel.DEBUG, prefix, "group", color);
      this.groupEnd = makeLogMethod(level, DebugLevel.DEBUG, prefix, "groupEnd", color);

      // Add assert handler
      // Unfortunately, this won't preserve line numbers in anything other than Chrome.
      this.assert = function(condition, ...messages) {
        if (!!condition) return;
        this.error.apply(object, messages);
        throw new TypeError(messages.join(" "));
      }
    }
  });

  // Set up methods according to the debug level.
  object.setDebugLevel(object.DEBUG_LEVEL);

  return object;
}

//
// Utility
//

// HACK: Chrome magically preserves stack traces

// Create a logging function.
export function makeLogMethod(objectLevel, methodLevel, prefix, consoleMethod, color) {
  // If object has that level turned off, return no-op.
  if (methodLevel > objectLevel) return Function.prototype;

  // If no prefix, just return bound console method.
  if (!prefix) return console[consoleMethod].bind(console);

  // For node, just output the prefix without colors
  // TODO: use colors ala https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script
  if (isNode) {
    return console[consoleMethod].bind(console, `${prefix}: `);
  }

  // With prefix: use currying to apply prefix automatically.
  const style = `color:white;background-color:${color};border-radius:3px;border:1px solid ${color};`
  return console[consoleMethod].bind(console, `%c ${prefix} `, style);
}


export function colorLogMessages(prefix, style = ";", messageBits = []) {
  const results = ["%c"];
  if (prefix) {
    results[0] += `${prefix}: %c`;
    results.push(style + "; font-weight: bold");
  }

  let objectified = false;
  messageBits.forEach( bit => {
    // If we already found an object, just output into the results
    if (objectified)
      return results.push(bit);

    const type = typeof bit;
    const isStringish
      =  bit == null
      || type === "string"
      || type === "number"
      || type === "boolean"
    ;
    if (isStringish)
      results[0] += bit + " ";
    else {
      objectified = true;
      results.push(style);
      results.push(bit);
    }
  });

  // Add style if we didn't already output it
  if (!objectified)
    results.push(style);

  return results;
}
window.colorLogMessages = colorLogMessages;

// Return a numeric debug level given `debugFlag` as:
//  - a number (one of the `DEBUG` etc constants), or
//  - a string ("DEBUG", "ERROR", etc)
export function normalizeDebugLevel(debugFlag) {
  if (typeof debugFlag === "string") {
    debugFlag = debugFlag.toUpperCase();
    switch (debugFlag) {
      case "OFF":     return DebugLevel.OFF;
      case "ERROR":   return DebugLevel.ERROR;
      case "WARN":    return DebugLevel.WARN;
      case "INFO":    return DebugLevel.INFO;
      case "DEBUG":   return DebugLevel.DEBUG;
      default:
        throw new TypeError(`normalizeDebugLevel(): dont understand debugFlag ${JSON.stringify(debugFlag)}`);
    }
  }
  if (typeof debugFlag === "number")
    return debugFlag;

  throw new TypeError(`normalizeDebugLevel(): dont understand debugFlag ${JSON.stringify(debugFlag)}`);
}
