import { proto } from "@spell-app/util"
import { classes } from "./classes.parser"
import { NewList } from "./NewList"

/**
 * `outline_specifier_list` rule:  `a list of people` -- in a type's outline body, a property holding a list,
 * e.g. `- its "people" is a list of people` (epic `people-and-orgs`).
 * - Empty to start with:  it compiles to `new List(...)`, made once per instance, as `as a new list of people` does.
 * - `a new list of people` says the same.
 * - The type is required:  `its "people" is a list` alone doesn't say what it holds.
 */
export class OutlineSpecifierList extends NewList {
  @proto static alias = "outline_specifier"
}
classes.addRule(OutlineSpecifierList, {
  syntax: "a new? (list|List) of {instanceType:type}",
  tests: [
    {
      tests: [
        ["a list of people", 'new List({ instanceType: "Person" })', 'new List<Person>({ instanceType: "Person" })'],
        ["a new list of people", 'new List({ instanceType: "Person" })', 'new List<Person>({ instanceType: "Person" })']
      ]
    }
  ]
})
