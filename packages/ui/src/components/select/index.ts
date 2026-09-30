/**
 * Barrel for the select -- also the `select` lib entry (`@spell/ui/select`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-item>` (through `$/components/item`, first, so the select can read upgraded items)
 *   and `<ui-select>`.
 */

import { UISelect } from "./UISelect"

import "$/components/item"

UISelect.define()

export { UISelect }
