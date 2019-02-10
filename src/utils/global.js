// Make sure `global` is defined globally:
//  - either as the nodejs `global`, or
//  - as an alias for `window` in browsers, or
//  - for the `self` context in web workers.
//
// NOTE: this modifies the "global" environment by making sure "global" is set.!
//

let global_identifier;
if (typeof global !== "undefined") {
  //  console.log("Running in node");
  global_identifier = global;
}

if (typeof window !== "undefined") {
  //  console.log("Running in a web browser");
  window.global = window;
  global_identifier = window;
}

if (typeof self !== "undefined") {
  //  console.log("Running in a web worker");
  self.global = self;
  global_identifier = self;
}

// Export for consumption by import.
export default global_identifier;
