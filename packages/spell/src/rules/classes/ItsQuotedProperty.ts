import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `its_quoted_property` rule:  `its "color"` in an outline body -- the third `type_property` spelling, for
 * `property_value_either`: `- its "color" is red if its suit is either diamonds or hearts otherwise it is black`.
 * - The quotes are optional (epic page Q4):  `- its color is red if ...`.
 */
export class ItsQuotedProperty extends P.Sequence<"type|property"> {
  @proto static alias = "type_property"
}
classes.addRule(ItsQuotedProperty, {
  syntax: "{type:subject_its} {property:quoted_member}"
})
classes.addRule(ItsQuotedProperty, {
  syntax: "{type:subject_its} {property:member_words}"
})
// ... and with the subject left out (P8):  `- "color" is red if ...`
classes.addRule(ItsQuotedProperty, {
  syntax: "{type:subject_implied} {property:quoted_member}"
})
// ... and a bare name (P9):  `- color is red if ...`
classes.addRule(ItsQuotedProperty, {
  syntax: "{type:subject_implied} {property:body_member_words}"
})
