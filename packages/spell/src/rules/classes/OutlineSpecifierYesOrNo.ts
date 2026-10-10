import { proto } from "$/util"
import { classes } from "./classes.parser"
import { TypeSpecifierYesOrNo } from "./TypeSpecifierYesOrNo"

/** `outline_specifier_yes_or_no` rule:  `yes or no` -- see `outline_specifier_enum`. */
export class OutlineSpecifierYesOrNo extends TypeSpecifierYesOrNo {
  @proto static alias = "outline_specifier"
}
classes.addRule(OutlineSpecifierYesOrNo, {
  syntax: "either? (yes or no|true or false)",
  tests: [{ tests: [["yes or no", "choice"]] }]
})
