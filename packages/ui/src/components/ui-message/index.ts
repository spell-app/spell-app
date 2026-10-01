/**
 * Barrel for the message -- also the `message` lib entry (`@spell-app/ui/ui-message`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-message>`, which registers it as the owner of `header` and `content` parts.
 */

import { UIMessage } from "./UIMessage"

UIMessage.define()

export { UIMessage }
