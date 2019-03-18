// Define a rule for a Parser instance.

import { getDescriptorProp, setDescriptorProp, clearDescriptorProp } from "./decorators.js";

export function defineRules(descriptor) {
console.warn(0, descriptor);
  const { key } = descriptor;
  const getRules = getDescriptorProp(descriptor, "initializer");
//  descriptor = setDescriptorProp(descriptor, "key", "__default_rules__");
  descriptor = setDescriptorProp(descriptor, "placement", "prototype");
  descriptor = setDescriptorProp(descriptor, "initializer", function() {
    const rules = getRules();
    return this.defineRules(rules);
  });
  return descriptor;
}

