/*global global window self*/

// Make sure `global` is defined globally:
//  - either as the nodejs `global`, or
//  - as an alias for `window` in browsers, or
//  - for the `self` context in web workers.
//
let _global;
if (typeof global !== "undefined") {
  //  console.log("Running in node");
  _global = global;
}

if (typeof window !== "undefined") {
  //  console.log("Running in a web browser");
  _global = window;
}

if (typeof self !== "undefined") {
  //  console.log("Running in a web worker");
  _global = self;
}

// Export for consumption by import.
export default _global;

// Return localStorage, or make one up if not found
let _localStorage;
if (_global.localStorage) {
  _localStorage = _global.localStorage;
} else {
  _localStorage = {};
}
export { _localStorage as localStorage };
