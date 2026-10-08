/**
 * The nag family:  defines `<ui-nag>` and exports its component, `UINag`, its DOM element, `DOMNagElement`,
 * and `DismissalStore`, where a nag remembers it was dismissed.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-nag` entry (its size is in `docs/report.md`).
 */

import { DOMNagElement, UINag } from "./UINag"
import { DismissalStore } from "./DismissalStore"

UINag.define()

export { UINag, DOMNagElement, DismissalStore }
