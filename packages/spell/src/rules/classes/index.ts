/**
 * Rules for classes -- declaring types (`is a`, `is a list of`), constructing instances (`a new`,
 * `create`), declaring/deriving instance properties (`has`, `is red if`, `is:`), and templated boolean
 * methods generated from quoted phrases (`"is a (rank)"`).
 * - `type_specifier_*` rules are the `as ...` clauses `define_property_has` accepts after a property
 *   name, e.g. `as either red or black` / `as a number` / `as a new thing` / `as yes or no`.
 * - `the_property_of_a_thing` / `a_things_property` are the two `type_property` spellings shared by
 *   `property_value_either` / `property_value_getter`.
 * - One rule per file, each registering itself on `classes` (`classes.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./classes.parser"
export * from "./classes.shared"
export * from "./WithNestedStatements"
export * from "./TypeDeclaration"
export * from "./CreateType"
export * from "./CreateListType"
export * from "./BelongsToOne"
export * from "./CanBelongToMany"
export * from "./ListGuard"
export * from "./NewThing"
export * from "./NewList"
export * from "./CreateThing"
export * from "./TypeSpecifierEnum"
export * from "./TypeSpecifierDatatype"
export * from "./TypeSpecifierInstance"
export * from "./TypeSpecifierYesOrNo"
export * from "./ClassMember"
export * from "./DefinePropertyHas"
export * from "./OutlineSpecifierEnum"
export * from "./OutlineSpecifierDatatype"
export * from "./OutlineSpecifierYesOrNo"
export * from "./ValueKind"
export * from "./ThePropertyOfAThing"
export * from "./AThingsProperty"
export * from "./ItsQuotedProperty"
export * from "./PropertyValueEither"
export * from "./PropertyValueGetter"
export * from "./DrawSide"
export * from "./QuotedPropertyRule"
export * from "./QuotedPropertyFormula"
