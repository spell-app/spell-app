/**
 * Barrel for the generic content parts -- also the `parts` lib entry (`@spell/ui/parts`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines all 13 part elements.
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
