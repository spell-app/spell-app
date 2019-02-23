/////////////////////////////////////
//
//  Add console logging methods to an arbitrary object.
//
//  call `addDebugMethods(object, prefix = "", debugLevel = ERROR)` to:
//  - add `object.DEBUG_LEVEL` flag whose initial value is `debugLevel`.
//  - add `object.setDebugLevel(debugLevel)` (you can pass DEBUG constant or "DEBUG")
//  - add `object.debug(...message)`
//  - add `object.info(...message)`
//  - add `object.warn(...message)`
//  - add `object.error(...message)`
//  - add `object.assert(condition, message)`
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


// Colors
const ERROR_STYLE = undefined;      // use default console style
const WARN_STYLE = undefined;       // use default console style
const INFO_STYLE = `color: blue;`;
const DEBUG_STYLE = `color: #999;`;


// Add debug methods to `object`
export default function addDebugMethods(prefix, object = {}, debugLevel = DebugLevel.INFO) {
    if (!prefix)
        throw new TypeError("addDebugMethods(): you must pass a 'prefix'");

    // Set initial `DEBUG` level
    // NOTE: if already set on the object, don't override
    if (!("DEBUG" in object))
        object.DEBUG = normalizeDebugLevel(debugLevel);

    // Set `setDebugLevel` method
    object.setDebugLevel = function(debugLevel) {
        this.DEBUG = normalizeDebugLevel(debugLevel);
    }

    // Add normal debuggers
    object.debug = makeLogger(DebugLevel.DEBUG, prefix, DEBUG_STYLE, "log");
    object.info = makeLogger(DebugLevel.INFO, prefix, INFO_STYLE, "info");
    object.warn = makeLogger(DebugLevel.WARN, prefix, WARN_STYLE, "warn");
    object.error = makeLogger(DebugLevel.ERROR, prefix, ERROR_STYLE, "error");

    // Add assert
    object.assert = function(condition, ...messages) {
        if (!!condition) return;
        this.error.apply(object, messages);
        throw new TypeError(messages.join(" "));
    }

    return object;
}
window.addDebugMethods = addDebugMethods;

//
// Utility
//

// Create a logging function.
export function makeLogger(debugLevel, prefix, style, consoleMethodName = "log") {
    return function(...messageBits) {
        if (debugLevel > this.DEBUG)
            return;
        // Ignore coloring on node since it doesn't work that way... :-(
        const coloredBits
                = isNode
                ? messageBits
                : colorLogMessages(prefix, style, messageBits);
        // Call original console method
        console[consoleMethodName](...coloredBits)
    }
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
