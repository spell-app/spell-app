import { For, Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { docsInspectorVocabulary } from "./UIDocsInspector.en"
import { ElementSnapshot, type SnapshotRow } from "./ElementSnapshot"

import inspectorCSS from "./UIDocsInspector.css?inline"

/****************
 * ### `UIDocsInspector`
 * The component behind `<ui-docs-inspector for="save">`:  a live view of the element whose id `for` names --
 * its attributes, its properties and the `:state()`s it's in --
 * for docs pages that teach how elements work.
 * Click the element, and watch its rows change.
 *
 * - Its shadow DOM:
 *   `<div class="ui inspector" part="inspector">` holding a title line (`<ui-button id="save">`)
 *   and three groups (`part="group"`):  attributes, properties, states.
 *   - each group a `<dl>` of rows (`part="row"`:  `name`, `value`);  states a `<ul>` of `:state(x)` names
 *   - a row that changes draws again, and flashes once (none under `prefers-reduced-motion`)
 * - What it reads, through `ElementSnapshot`:
 *   attributes as written, a Spell UI element's vocabulary properties, its custom states.
 *   `all` shows unset properties too.
 * - How it stays live:  while connected, it reads the element again every `REFRESH_SECONDS`.
 *   - Why a timer:  custom states have no change event, and a property can change without any attribute.
 *   - A read that finds nothing new writes nothing:  the view only redraws for a real change.
 * - Finds the element in its own document (or shadow root), by id, at every read:
 *   an element added later, or a new `for`, is picked up at the next one.
 *   `:state(missing)` while there's none.
 ****************/
export class UIDocsInspector extends E.UIComponent<typeof docsInspectorVocabulary> {
  @E.proto static vocabulary = docsInspectorVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "docs-inspector": inspectorCSS },
    delegatesFocus: false,
    aria: { role: "group" }
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The element shown
  ////////////////

  /** Its tag and id, as the title line shows them:  `<ui-button id="save">`;  `undefined` while it's missing. */
  @E.state accessor title: string | undefined = undefined

  /** No element has the `for` id. */
  @E.cssState("missing")
  get isMissing(): boolean {
    return this.title === undefined
  }

  /**
   * The inspector's accessible name:  "Live view of <ui-button id="save">".
   * - `undefined` until `isReady`:  the texts come from the runtime (`UI.i18n`), which throws before it has loaded.
   */
  @E.aria("ariaLabel")
  get label(): string | undefined {
    if (!this.isReady) return undefined
    return this.translationForKey("label", { target: this.title ?? `#${this.for ?? ""}` })
  }

  /** The element `for` names, in the inspector's own document or shadow root. */
  private get target(): Element | undefined {
    const id = this.for
    if (!id) return undefined
    const root = this.domElement.getRootNode() as Document | ShadowRoot
    return (root.getElementById?.(id) ?? this.domElement.ownerDocument.getElementById(id)) || undefined
  }

  ////////////////
  // ## The rows
  ////////////////

  /** The element's attributes. */
  @E.state({ equals: E.isSameList }) accessor attributeRows: readonly SnapshotRow[] = []

  /** Its vocabulary's properties. */
  @E.state({ equals: E.isSameList }) accessor propertyRows: readonly SnapshotRow[] = []

  /** Its custom states. */
  @E.state({ equals: E.isSameList }) accessor states: readonly string[] = []

  /** Read the element again;  writes only what changed. */
  @E.untracked
  refresh() {
    const target = this.target
    if (!target) {
      this.title = undefined
      this.attributeRows = []
      this.propertyRows = []
      this.states = []
      return
    }
    const snapshot = new ElementSnapshot(target, { all: !!this.all })
    this.title = `<${target.localName}${target.id ? ` id="${target.id}"` : ""}>`
    this.attributeRows = ElementSnapshot.keepUnchanged(this.attributeRows, snapshot.attributes)
    this.propertyRows = ElementSnapshot.keepUnchanged(this.propertyRows, snapshot.properties)
    this.states = snapshot.states
  }

  /** While connected:  read now, then every `REFRESH_SECONDS`;  again at once for a new `for` or `all`. */
  @E.onChange("isConnected", "for", "all")
  protected onTargetChanged(isConnected: boolean) {
    if (!isConnected) return undefined
    this.refresh()
    return E.every(REFRESH_SECONDS, () => this.refresh())
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("inspector")}>
        <div class={TITLE_CLASS} part={this.partForName("title")}>
          <code>{this.title ?? `#${this.for ?? ""}`}</code>
        </div>
        <Show
          when={!this.isMissing}
          fallback={
            <p class={MISSING_CLASS} part={this.partForName("missing")}>
              {this.translationForKey("missing", { id: this.for ?? "" })}
            </p>
          }
        >
          <div class={GROUPS_CLASS}>
            {this.group(this.translationForKey("attributes"), this.$.attributeRows)}
            {this.group(this.translationForKey("properties"), this.$.propertyRows)}
            <section class={GROUP_CLASS} part={this.partForName("group")}>
              <div class={CAPTION_CLASS} part={this.partForName("caption")}>
                {this.translationForKey("states")}
              </div>
              <Show when={this.states.length > 0} fallback={this.none()}>
                <ul>
                  <For each={this.states}>
                    {(name) => (
                      <li class={ROW_CLASS} part={this.partForName("row")}>
                        <code part={this.partForName("name")}>:state({name})</code>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </section>
          </div>
        </Show>
      </div>
    )
  }

  /**
   * A group of name / value rows, under `caption`.
   * - `rows` is an accessor (`this.$.attributeRows`), read inside the JSX:
   *   a new list then updates the `<For>`, which keeps each unchanged row's DOM.
   * - A plain list would be read once by the caller, and the whole group would draw again on every change.
   */
  private group(caption: string, rows: () => readonly SnapshotRow[]): JSX.Element {
    return (
      <section class={GROUP_CLASS} part={this.partForName("group")}>
        <div class={CAPTION_CLASS} part={this.partForName("caption")}>
          {caption}
        </div>
        <Show when={rows().length > 0} fallback={this.none()}>
          <dl>
            <For each={rows()}>
              {(row) => (
                <div class={ROW_CLASS} part={this.partForName("row")}>
                  <dt part={this.partForName("name")}>{row.name}</dt>
                  <dd part={this.partForName("value")}>{row.value}</dd>
                </div>
              )}
            </For>
          </dl>
        </Show>
      </section>
    )
  }

  /** What an empty group shows. */
  private none(): JSX.Element {
    return <div class={NONE_CLASS}>{this.translationForKey("none")}</div>
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDocsInspector extends E.AttributeValues<typeof docsInspectorVocabulary> {}

/** How often the element is read again, in seconds:  ten times a second, fast enough to look instant. */
const REFRESH_SECONDS = 0.1

/** Class of the title line. */
const TITLE_CLASS = "title"

/** Class of the box holding the three groups. */
const GROUPS_CLASS = "groups"

/** Class of one group. */
const GROUP_CLASS = "group"

/** Class of a group's title. */
const CAPTION_CLASS = "caption"

/** Class of one row:  a new row flashes. */
const ROW_CLASS = "row"

/** Class of an empty group's "none". */
const NONE_CLASS = "none"

/** Class of the "no element" message. */
const MISSING_CLASS = "missing"
