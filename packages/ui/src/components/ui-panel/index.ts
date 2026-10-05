/**
 * Barrel for the panel -- also the `panel` lib entry (`@spell-app/ui/ui-panel`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-panel>`;  importing `UIPanel` defines `<ui-sections>` and `<ui-section>` first (the
 *   section family's barrel), which panels subclass and nest in.
 */

import { UIPanel } from "./UIPanel"

UIPanel.define()

export { UIPanel }
