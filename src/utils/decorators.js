//
//  # ESNext Stage 2 decorators
//

import assert from "assert";

// Define field or method on the prototype rather than during object construction.
// Use with caution with objects or arrays, as the values will be shared with all instances!
export function proto(descriptor) {
  assert(descriptor.kind === "field" || descriptor.kind === "method");
  return {
    ...descriptor,
    placement: "prototype"
  }
}
