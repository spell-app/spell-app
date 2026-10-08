/**
 * The generic content parts family:  defines the 13 part tags (`<ui-content>`, `<ui-header>`, `<ui-meta>` ...)
 * and exports their components.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-parts` entry (its size is in `docs/report.md`).
 */

import { UIContent } from "./UIContent"
import { UIHeader } from "./UIHeader"
import { UIDescription } from "./UIDescription"
import { UIMeta } from "./UIMeta"
import { UIExtra } from "./UIExtra"
import { UIActions } from "./UIActions"
import { UITitle } from "./UITitle"
import { UISummary } from "./UISummary"
import { UIDate } from "./UIDate"
import { UIAuthor } from "./UIAuthor"
import { UIAvatar } from "./UIAvatar"
import { UIDetail } from "./UIDetail"
import { UIValue } from "./UIValue"

UIContent.define()
UIHeader.define()
UIDescription.define()
UIMeta.define()
UIExtra.define()
UIActions.define()
UITitle.define()
UISummary.define()
UIDate.define()
UIAuthor.define()
UIAvatar.define()
UIDetail.define()
UIValue.define()

export {
  UIActions,
  UIAuthor,
  UIAvatar,
  UIContent,
  UIDate,
  UIDescription,
  UIDetail,
  UIExtra,
  UIHeader,
  UIMeta,
  UISummary,
  UITitle,
  UIValue
}
