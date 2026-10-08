import { untrack, type Accessor } from "solid-js"

import { Cell } from "$/ui/core"

import { BEFORE_MATCH, UNTIL_FOUND } from "./epic-item.types"

/****************
 * ### `Fold`
 * The open / folded state of a box an `<epic-*>` element folds by itself, never written to the file:  Choices, an
 * answered question's option panels, More Details, Original Discussion.  (`<epic-item>` folds through its `open`
 * attribute instead:  links and P9 open it from outside.)
 * - Starts as `initial()` says, and follows it until the reader toggles it:  an option panel opens while its option
 *   is the chosen one.
 * - The content box takes `hidden()` and `watch` as its ref:  folded, it's `hidden="until-found"`, so find-in-page
 *   reaches the text and unfolds it (`beforematch`).
 * - MUST be created under the element's owner (field initializer):  it creates a signal.
 ****************/
export class Fold {
  /** The reader's choice, once made;  `undefined` until then. */
  private readonly toggled = new Cell<boolean | undefined>(undefined)

  constructor(private readonly initial: Accessor<boolean>) {}

  /** Open?  Tracked. */
  readonly isOpen = (): boolean => this.toggled.get() ?? this.initial()

  /** The content box's `hidden`:  `until-found` while folded;  tracked. */
  readonly hidden = (): typeof UNTIL_FOUND | undefined => (this.isOpen() ? undefined : UNTIL_FOUND)

  /** Open if folded, fold if open:  a click on its header. */
  readonly toggle = () => {
    this.toggled.set(!untrack(this.isOpen))
  }

  /** The content box's ref:  find-in-page matched inside the folded box, which the browser has revealed. */
  readonly watch = (content: HTMLElement) => {
    content.addEventListener(BEFORE_MATCH, () => this.toggled.set(true))
  }
}
