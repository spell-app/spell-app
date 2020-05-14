/* eslint-disable import/prefer-default-export */

//
//  # Class utilities
//

// Clone a class, re-using the original name.
// If it didn't work, returns the original constructor.
export function cloneClass(constructor, name) {
  try {
    // eslint-disable-next-line no-new-func
    return new Function("constructor", `return class ${name} extends constructor {}`)(constructor)
  } catch (e) {
    console.warn(`cloneClass(): can't make clone with name ${name}: please rename`)
    return constructor
  }
}

export function hasOwnProp(thing, key) {
  if (!thing) return false
  return Object.prototype.hasOwnProperty.call(thing, key)
}
