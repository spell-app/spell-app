/**
 * `epic-answer` family barrel:  defines `<epic-answer>`, `<epic-reply>`, `<epic-more>` (SIDE EFFECT) and exports
 * their classes.
 */
import { EpicAnswer } from "./EpicAnswer"
import { EpicReply } from "./EpicReply"
import { EpicMore } from "./EpicMore"

EpicAnswer.define()
EpicReply.define()
EpicMore.define()

export { EpicAnswer, EpicReply, EpicMore }
