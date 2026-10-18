// Import directly to avoid circular import
import { Thing } from "./Thing"

/**
 * `Drawable`:  a `Thing` drawn as its own custom element -- what `a card is a drawable thing` extends.
 * - Its tag starts with its project's or library's name, made singular:  `<solitaire-card>` in a solitaire app.
 * - The element comes from `core.defineElement()`, which the page running the program fills in:
 *   core may not import Solid or Spell UI.
 * - Everything else as a `Thing`.
 */
export class Drawable extends Thing {}
