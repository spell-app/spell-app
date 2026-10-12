import { proto } from "$/util"
import type { P } from "$/parser"
import { classes } from "./classes.parser"
// Import directly to avoid circular import
import { CreateListType } from "./CreateListType"

/**
 * `create_drawable_list_type` rule:  `a pile is a drawable list of cards` -- `create_list_type`, extending `DrawableList`.
 * - A list drawn as its own custom element, its items inside it (epic `drawable-thing`).
 * - Everything else as `create_list_type`:  its item type, a short name, an outline body.
 */
export class CreateDrawableListType extends CreateListType {
  @proto static listType: P.Datatype = "drawable list"
}
classes.addRule(CreateDrawableListType, {
  syntax:
    "(a|an) {type:type_words} (aka {aka:singular_type})? is (a|an) drawable list of {instanceType:type} {with_nested_statements}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [
          "a pile is a drawable list of cards",
          [
            "export class Pile extends DrawableList {",
            "  static instanceType = Card",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}"
          ],
          [
            "export class Pile extends DrawableList<Card> {",
            "  static instanceType = Card",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}",
            "",
            "/**",
            " * `<test-class-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.",
            " * - The page defines its tag with this class:  `spellCore.useElement()`, below.",
            " * - Its attributes are its pile's properties;  its methods call its pile's.",
            " * - What every drawable thing's element does, e.g. drawing its pile, is `SpellElement`'s.",
            " */",
            "export class PileElement extends SpellElement<Pile> {",
            '  @E.proto static vocabulary = SpellElement.vocabularyFor("test-class-pile", "pile", [])',
            "}",
            "spellCore.useElement(Pile, PileElement)"
          ]
        ]
      ]
    },
    {
      compileAs: "block",
      tests: [
        [
          "a pile is a drawable list of cards with:",
          [
            "export class Pile extends DrawableList {",
            "  static instanceType = Card",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}"
          ],
          [
            "export class Pile extends DrawableList<Card> {",
            "  static instanceType = Card",
            '  static elementTag = spellCore.defineElement(this, "test_classes")',
            "}",
            "",
            "/**",
            " * `<test-class-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.",
            " * - The page defines its tag with this class:  `spellCore.useElement()`, below.",
            " * - Its attributes are its pile's properties;  its methods call its pile's.",
            " * - What every drawable thing's element does, e.g. drawing its pile, is `SpellElement`'s.",
            " */",
            "export class PileElement extends SpellElement<Pile> {",
            '  @E.proto static vocabulary = SpellElement.vocabularyFor("test-class-pile", "pile", [])',
            "}",
            "spellCore.useElement(Pile, PileElement)"
          ]
        ]
      ]
    }
  ]
})
