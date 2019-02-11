//
//  # Class utilities
//

import global from "./global.js";

// Clone a class, re-using the original name.
// TODO: move to utility?
export function cloneClass(constructor, name = constructor.name) {
  // Clone the constructor, keeping the same name
  global.__cloneClass__ = constructor;
  const clone = new Function("name", `return class ${name} extends __cloneClass__ {}`)();
  delete global.__cloneClass__;
  return clone;
}
