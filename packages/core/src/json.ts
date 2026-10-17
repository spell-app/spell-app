/**
 * `core.fromJSON()`:  a spell object's JSON read back as what it was (epic `output-targets`, P15, Q49).
 * - A thing's JSON says its class first, `"$type"`, then its props:  `Thing.toJSON()`.
 * - A list's says its class, its own props, then its items (`List.toJSON()`):
 *   `{ "$type": "Pile", "name": "stock", "$items": [...] }`.
 */
import { core } from "./core"
import { defineCoreModule } from "./core.types"
import { StateMirror } from "./state"

export const jsonMethods = defineCoreModule({
  /**
   * `json` read back as what it was:  each object with a `"$type"` rebuilt as the program's class of that name,
   * each of its props rebuilt the same way, and so on down.
   * - `json`:  JSON text, or a value `JSON.parse()` already answered.  A string is always read as JSON text.
   * - The class:  one the program declares, or a project it imports, has (see `ThingRegistry.classNamed()`);
   *   else spell's own, e.g. `List`.
   * - Made as the program makes one, `new Card({ rank, suit })`:  through its setters, then its `create()`.
   *   - A prop with no setter is set after.
   *   - It's one of the program's things then, in the Thing Explorer.
   * - A list:  its own props as above, then its items from `"$items"`, each rebuilt, set as its `items`.
   *   - So an exclusive list, e.g. a `Pile`, owns its cards (`List.writeItems()`).
   *   - What its `create()` added is replaced.
   * - An unknown `"$type"`, no class by that name:  a plain object, its `"$type"` kept, its fields rebuilt.
   *   NEVER throws for one.
   * - JSON with ids, a `StateWriter`'s (`state.ts`):  a thing mentioned twice comes back as one.
   *   Without them, JSON keeps no identity:  a card in two places comes back as two cards.
   * - throws:  `json` is text that isn't JSON (`JSON.parse()`'s `SyntaxError`).
   */
  fromJSON(json: unknown): unknown {
    return new StateMirror().read(typeof json === "string" ? JSON.parse(json) : json)
  }
})
Object.assign(core, jsonMethods)
