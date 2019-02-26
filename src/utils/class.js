//
//  # Class utilities
//

// Clone a class, re-using the original name.
// If it didn't work, returns the original constructor.
export function cloneClass(constructor, name) {
  try {
    return new Function("constructor", `return class ${name} extends constructor {}`)(constructor);
  }
  catch (e) {
    console.warn(`cloneClass(): can't make clone with name ${name}: please rename`);
    return constructor;
  }
}
