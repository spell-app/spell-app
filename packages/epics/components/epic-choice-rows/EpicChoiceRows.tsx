import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { ChoicesForm } from "$/epics/answers"

import { epicChoiceRowsVocabulary } from "./EpicChoiceRows.en"
import { ROW_TAG } from "./EpicChoiceRows.types"
import type { EpicChoiceRow } from "./EpicChoiceRow"

import rowsCSS from "./EpicChoiceRows.css?inline"

/****************
 * ### `EpicChoiceRows`
 * The component behind `<epic-choice-rows>`:  one section's table on a choice page (epic `epic-workflow`
 * P12).
 * - Draws the column heads, then its rows (`<epic-choice-row>`s, its children) on the same columns:  a grid, each
 *   row a subgrid of it.
 *   - `no-file`:  no File column;  `stacked`:  Current and Recommended in one column, Syntax
 *   - Under 720px the grid keeps that width, and scrolls inside its own box, never the page.
 * - Counts its rows on its `<ui-section>`'s title (`badge`):  `3 to change · 1 stay`, then `· 1 changed` once Owen
 *   changed some.  Follows the page's `ChoicesForm`, where its rows register.
 * - `reorder` (epic `epic-workflow` P15):  Owen puts its rows in order.
 *   - A first column, Order:  each row's place, and its move up / move down buttons (`EpicChoiceRow`).
 *   - Its badge counts the rows (`9 in order`), then `· moved` once they're out of the order Claude proposed:  the
 *     order its rows were written in, read as it first connects.
 *   - The order Owen left comes back on load (`ChoicesForm.restoredOrder`):  it puts its rows in it, once.
 * - SIDE EFFECT:  writes its section's `badge`;  with `reorder`, moves its rows into the order read back.
 ****************/
export class EpicChoiceRows extends E.UIComponent<typeof epicChoiceRowsVocabulary> {
  @E.proto static vocabulary = epicChoiceRowsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-choice-rows": rowsCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Its rows' elements, in order. */
  @E.watches({ childList: true })
  get rows(): readonly Element[] {
    return isServer ? [] : Array.from(this.domElement.children).filter((child) => child.localName === ROW_TAG)
  }

  /** The page's form's `version`, as last heard:  `badgeText` reads it, so it counts again on every change. */
  @E.state accessor version = 0

  /** With `reorder`:  its rows' names in the order Claude proposed, as written;  read as it first connects. */
  private proposed: string[] | undefined

  /** The order read back on load has been put in (once). */
  private isRestored = false

  /** Its rows' names, in their order now. */
  get names(): string[] {
    return this.rows.map((row) => row.getAttribute("name") ?? "")
  }

  /** With `reorder`:  its rows are out of the order Claude proposed. */
  get isMoved(): boolean {
    void this.version
    return !!this.proposed && this.names.join("\n") !== this.proposed.join("\n")
  }

  /** Its section's count:  renames and rows that stay (with `reorder`:  the rows, and moved), and how many Owen changed. */
  get badgeText(): string {
    void this.version
    const rows = this.rows
    const renames = rows.filter((row) => row.getAttribute("recommended") !== row.getAttribute("current")).length
    let count = this.reorder
      ? this.translationForKey("countOrdered", { rows: String(rows.length) })
      : this.translationForKey("count", { renames: String(renames), stay: String(rows.length - renames) })
    if (this.reorder && this.isMoved) count = this.translationForKey("countMoved", { count })
    const changed = rows.filter((row) => ((row as E.DOMElement).component as EpicChoiceRow | undefined)?.isChanged)
    return changed.length ? this.translationForKey("countChanged", { count, changed: String(changed.length) }) : count
  }

  /**
   * While connected, follow the page's form, and with `reorder` put its rows in the order read back on load;
   * returns the undo.
   */
  @E.whileConnected
  protected followForm() {
    const form = ChoicesForm.forPage()
    if (this.reorder) this.proposed ??= this.names
    const heard = () => {
      if (this.reorder) this.restoreOrder(form)
      this.version = form.version
    }
    heard()
    return form.subscribe(heard)
  }

  /**
   * Put its rows in the order the page's form read back for its section (`restoredOrder`), once:  those named first,
   * in that order, then any it doesn't name, as they were.
   * - SIDE EFFECT:  moves its row elements
   */
  private restoreOrder(form: ChoicesForm) {
    const key = this.domElement.closest("ui-section")?.id
    const order = key ? form.restoredOrder[key] : undefined
    if (this.isRestored || !order) return
    this.isRestored = true
    const rows = this.rows
    const named = order.flatMap((name) => rows.filter((row) => row.getAttribute("name") === name))
    const sorted = [...named, ...rows.filter((row) => !named.includes(row))]
    if (sorted.every((row, i) => row === rows[i])) return
    this.domElement.append(...sorted)
  }

  /** Its count on its section's title. */
  @E.onChange("badgeText", "isConnected")
  protected markSection(text: string, connected: boolean) {
    if (connected) this.domElement.closest("ui-section")?.setAttribute("badge", text)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div
          class={[TABLE, { [NO_FILE]: !!this.noFile, [STACKED]: !!this.stacked, [REORDER]: !!this.reorder }]}
          part={this.partForName("table")}
          role="table"
        >
          <div class={HEAD} part={this.partForName("head")} role="row">
            <Show when={this.reorder}>
              <span role="columnheader">{this.translationForKey("order")}</span>
            </Show>
            <Show when={!this.noFile}>
              <span role="columnheader">{this.translationForKey("file")}</span>
            </Show>
            <span role="columnheader">{this.translationForKey("purpose")}</span>
            <Show when={!this.stacked} fallback={<span role="columnheader">{this.translationForKey("syntax")}</span>}>
              <span role="columnheader">{this.translationForKey("current")}</span>
              <span role="columnheader">{this.translationForKey("recommended")}</span>
            </Show>
          </div>
          <slot />
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicChoiceRows extends E.AttributeValues<typeof epicChoiceRowsVocabulary> {}

/** Classes of the shadow markup:  the grid, and its layouts;  the heads' row. */
const TABLE = "table"
const NO_FILE = "no-file"
const STACKED = "stacked"
const REORDER = "reorder"
const HEAD = "head"
