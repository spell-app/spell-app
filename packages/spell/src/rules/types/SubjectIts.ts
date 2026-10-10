import { proto } from "$/util"
import { types } from "./types.parser"
import { SubjectRule } from "./SubjectRule"

/**
 * `subject_its` rule:  `its`, as the subject of an outline body's line, e.g. `- its "suit" is ...`
 * -- see `SubjectRule`.
 */
export class SubjectIts extends SubjectRule {
  @proto static word = "its"
}
types.addRule(SubjectIts)
