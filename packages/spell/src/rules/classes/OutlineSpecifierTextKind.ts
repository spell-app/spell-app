import { proto } from "$/util"
import { classes } from "./classes.parser"
import { TypeSpecifierTextKind } from "./TypeSpecifierTextKind"

/** `outline_specifier_text_kind` rule:  `a url` / `an email` in an outline line -- see `type_specifier_text_kind`. */
export class OutlineSpecifierTextKind extends TypeSpecifierTextKind {
  @proto static alias = "outline_specifier"
}
classes.addRule(OutlineSpecifierTextKind, {
  syntax: "(a|an) (kind:url|email)",
  tests: [{ tests: [["a url", "text"]] }]
})
