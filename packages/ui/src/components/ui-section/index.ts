/**
 * Barrel for the section -- also the `section` lib entry (`@spell-app/ui/ui-section`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-sections>`, then `<ui-section>`;  both register as owners of `section` parts:  a
 *   nested `<ui-section>` finds the enclosing section or group through `PartContext` (its level, depth, sticky stack
 *   and default `collapsible`).
 * - NOTE: the group FIRST, so groups already in the page have their controllers when their sections upgrade and
 *   resolve them.
 */

import { UISections } from "./UISections"
import { UISection } from "./UISection"

UISections.define()
UISection.define()

export { UISection, UISections }
