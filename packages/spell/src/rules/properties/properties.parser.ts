/**
 * The `properties` rule module's parser:  each of its rule files registers on it (`properties.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for member rules:
 * - words naming a member:  `property`, `member_words`
 * - reading one:  `the X of Y`, `its X`, `its third X`
 * - object literals:  `object_literal_property`, `object_literal_properties`
 * - A read RESOLVES its words through the type of what it reads from (`property_expression`, `its_known_property`):
 *   several words, blacklisted ones too, e.g. `the short rank of the card`.
 * - Or it's LOOSE:  ONE word nothing declared, as every read was before types
 *   (`property_expression` too, `its_property`).  Plan doc D5.
 * - A type's class members, e.g. `card suits`, are `class_member`, in `classes/ClassMember.ts`.
 */
export const properties = new SpellParser({ module: "properties" })
