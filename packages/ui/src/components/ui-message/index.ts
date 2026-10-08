/**
 * The message family:  defines `<ui-message>` and exports its component, `UIMessage`.
 * - SIDE EFFECT:  importing it defines the tag, which registers it as the owner of the `header` and `content` parts.
 * - Also the library's `@spell-app/ui/ui-message` entry (its size is in `docs/report.md`).
 */

import { UIMessage } from "./UIMessage"

UIMessage.define()

export { UIMessage }
