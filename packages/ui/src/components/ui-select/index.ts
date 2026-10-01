/**
 * Barrel for the select -- also the `select` lib entry (`@spell-app/ui/ui-select`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>` (through `$/ui/components/ui-item`, first, so the select can read upgraded items)
 *   and `<ui-select>`.
 */

import { UISelect } from "./UISelect"

import "$/ui/components/ui-item"

UISelect.define()

export { UISelect }
