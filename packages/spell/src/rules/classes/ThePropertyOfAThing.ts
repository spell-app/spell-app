import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `the_property_of_a_thing` rule:  `the color of a card` -- one of two `type_property` spellings consumed by
 * `property_value_either` and `property_value_getter` below.  No `getAST()`: callers read
 * `match.groups.type`/`.property` directly.
 */
export class ThePropertyOfAThing extends P.Sequence<"property|type"> {
  @proto static alias = "type_property"
}
classes.addRule(ThePropertyOfAThing, {
  syntax: "the {property:member_words} of (a|an) {type}"
})
// a quoted name, "quotes teach a new word" (plan doc J3, option C):  `the "color" of a card is red if ...`
classes.addRule(ThePropertyOfAThing, {
  syntax: "the {property:quoted_member} of (a|an) {type}"
})
