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
 * The component behind `<epic-choice-rows>`:  one section's table on a syntax-choices page (epic `epic-workflow`
 * P12).
 * - Draws the column heads, then its rows (`<epic-choice-row>`s, its children) on the same columns:  a grid, each
 *   row a subgrid of it.
 *   - `no-file`:  no File column;  `stacked`:  Current and Recommended in one column, Syntax
 *   - Under 720px the grid keeps that width, and scrolls inside its own box, never the page.
 * - Counts its rows on its `<ui-section>`'s title (`badge`):  `3 to rename · 1 stay`, then `· 1 changed` once Owen
 *   changed some.  Follows the page's `ChoicesForm`, where its rows register.
 * - SIDE EFFECT:  writes its section's `badge`.
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

  /** Its section's count:  renames and rows that stay, and how many Owen changed. */
  get badgeText(): string {
    void this.version
    const rows = this.rows
    const renames = rows.filter((row) => row.getAttribute("recommended") !== row.getAttribute("current")).length
    const count = this.translationForKey("count", { renames: String(renames), stay: String(rows.length - renames) })
    const changed = rows.filter((row) => ((row as E.DOMElement).component as EpicChoiceRow | undefined)?.isChanged)
    return changed.length ? this.translationForKey("countChanged", { count, changed: String(changed.length) }) : count
  }

  /** While connected, follow the page's form;  returns the undo. */
  @E.whileConnected
  protected followForm() {
    const form = ChoicesForm.forPage()
    this.version = form.version
    return form.subscribe(() => (this.version = form.version))
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
          class={[TABLE, { [NO_FILE]: !!this.noFile, [STACKED]: !!this.stacked }]}
          part={this.partForName("table")}
          role="table"
        >
          <div class={HEAD} part={this.partForName("head")} role="row">
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
const HEAD = "head"
