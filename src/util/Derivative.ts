import { clearDerived, getDerived, getDerivedFrom, override } from "./extend"

/**
 * Base class to add `@derived`, `@derivedFrom`, `@override` functionality to class instances.
 * - Call as: `class MyClass extends Derivative {...}`
 */
export class Derivative {
  /**
   * Return derived `property` for this object by calling `getter()`.
   * returning the exact same value each time.
   * - To reset the value:
   *   - Call `this.clearDerived()` to reset all derived properties.
   *   - Call `this.clearDerived(property)` to reset just that property.
   */
  derived<T = any>(property: string, getter: () => T): T {
    return getDerived(this, property, getter)
  }
  /**
   * Return derived `property`, calling `getter()` again whenever `dependencies` change.
   * - By default, the same value will be returned each time.
   * - To reset the value:
   *   - Call `this.clearDerived()` to reset all derived properties.
   *   - Call `this.clearDerived(property)` to reset just that property.
   *   - Pass a `dependencies` array -- the value will change
   *     whenever any of the dependencies change.
   */
  derivedFrom<T = any>(property: string, getter: () => T, dependencies?: string[]): T {
    return getDerivedFrom(this, property, getter, dependencies)
  }
  /**
   * Clear derived properties, recalculating them next time they are accessed.
   * - Call with no arguments to reset ALL derived properties.
   * - Pass a specific `property` to clear just that property.
   */
  clearDerived(property: string) {
    clearDerived(this, property)
  }
  /** Overide getter for `property`, returning explicit `value` instead. */
  override<T>(property: string, value: T) {
    override(this, property, value)
  }
}
