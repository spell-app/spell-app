import { proto } from "$/util"
import { classes } from "./classes.parser"
import { TypeSpecifierDatatype } from "./TypeSpecifierDatatype"

/** `outline_specifier_datatype` rule:  `a number` -- see `outline_specifier_enum`. */
export class OutlineSpecifierDatatype extends TypeSpecifierDatatype {
  @proto static alias = "outline_specifier"
}
classes.addRule(OutlineSpecifierDatatype, {
  syntax: "(a|an) {datatype:singular_type}",
  tests: [{ tests: [["a number", "number"]] }]
})
// `a suit of its deck`:  a value kind, saying where its list is kept -- for the reader;  the kind says it already
classes.addRule(OutlineSpecifierDatatype, {
  syntax: "(a|an) {datatype:singular_type} of its {owner:member_words}",
  tests: [{ tests: [["a suit of its deck", "Suit"]] }]
})
// without the article, only a KNOWN type:  `its "name" is text`, but `its "x" is total` stays a getter (issue I2)
classes.addRule(OutlineSpecifierDatatype, {
  syntax: "{datatype:known_type}",
  tests: [
    {
      tests: [
        ["text", "text"],
        ["total", undefined]
      ]
    }
  ]
})
