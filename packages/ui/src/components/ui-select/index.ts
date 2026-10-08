/**
 * The select family:  defines `<ui-select>`, and exports its component.
 * - Also the `select` lib entry (`@spell-app/ui/ui-select`), measured in `docs/report.md`.
 * - SIDE EFFECT:  importing it defines `<ui-item>` (through `$/ui/components/ui-item`, first,
 *   so the select can read upgraded items), then `<ui-select>`.
 */

import { UISelect } from "./UISelect"

import "$/ui/components/ui-item"

UISelect.define()

export { UISelect }
