// Import directly to avoid circular import
import { List } from "./List"

/**
 * `DrawableList`:  a `List` drawn as its own custom element, its items inside it --
 * what `a pile is a drawable list of cards` extends.
 * - Its `draw()` draws its OUTSIDE;  each item draws itself, as one of its child elements.
 * - The element comes from `spellCore.defineElement()`, as a `Drawable`'s does.
 * - Everything else as a `List`.
 */
export class DrawableList<T = unknown> extends List<T> {}
