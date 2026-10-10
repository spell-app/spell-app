import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `a_things_property` rule:  `a cards color` -- the other `type_property` spelling, see `the_property_of_a_thing`
 * above.
 */
export class AThingsProperty extends P.Sequence<"type|property"> {
  @proto static alias = "type_property"
}
classes.addRule(AThingsProperty, {
  syntax: "(a|an) {type:plural_type} {property:member_words}"
})
