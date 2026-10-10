import { types } from "./types.parser"
import { SubjectRule } from "./SubjectRule"

/**
 * `subject_it` rule:  `it`, as the subject of an outline body's line, e.g. `- it has a deck` -- see `SubjectRule`.
 */
export class SubjectIt extends SubjectRule {}
types.addRule(SubjectIt)
