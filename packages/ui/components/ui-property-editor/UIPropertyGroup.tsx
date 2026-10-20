import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
// the family barrel, not the leaf:  the lib build then imports `ui-section.js` instead of splitting a shared chunk
// (SIDE EFFECT:  defines `<ui-section>` / `<ui-sections>`:  a group is a section)
import { UISection } from "$/ui/components/ui-section"
import type { SectionVocabulary } from "$/ui/components/ui-section/UISection.types"
import { propertyGroupVocabulary } from "./UIPropertyGroup.en"

import groupCSS from "./UIPropertyGroup.css?inline"

/****************
 * ### `DOMPropertyGroupElement`
 * The DOM element of `<ui-property-group>`:  a section's, plus what its editor tells it.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMPropertyGroupElement extends E.DOMLoadableBodyElement {
  /** A property in it (`identifier`) failed validation, or passed again:  `:state(error)` follows. */
  markFieldFailed(identifier: string, isFailed: boolean) {
    ;(this.component as UIPropertyGroup | undefined)?.markFieldFailed(identifier, isFailed)
  }

  /** A property in it holds an edit not saved yet, or none does:  `:state(changed)`. */
  markChanged(isChanged: boolean) {
    const component = this.component as UIPropertyGroup | undefined
    if (component) component.isChanged = isChanged
  }
}

/****************
 * ### `UIPropertyGroup`
 * The component behind `<ui-property-group>`:  a folding band of properties in a `<ui-property-editor>`.
 *
 * - It IS a `<ui-section>` (it extends `UISection`):  the same attributes, slots, parts, events and folding.
 *   - All but `source`:  a group's properties come from its editor.
 *   - Its `select` picks its part of the editor's page (P6).
 * - Its own:
 *   - `output`, at the end of the title bar
 *   - `error`, a line under the title
 *   - `state` tints its title
 *   - `:state(error)`:  its own `error`, or a property failing validation
 *   - `readonly`:  every property in it is readonly (each reads it as it connects)
 *   - `:state(changed)`:  a property in it holds an edit not saved yet
 * - The editor tells it about its properties (`markFieldFailed()`, `markChanged()`),
 *   and sends it `ui-invalid` and `ui-success`.
 ****************/
export class UIPropertyGroup extends UISection {
  // the section's names under the group's tag, and its own:  TypeScript only knows the section's literals
  @E.proto static vocabulary = propertyGroupVocabulary as unknown as SectionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { ...UISection.prototype.elementSetup.styleSheets, group: groupCSS },
    DOMElement: DOMPropertyGroupElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Errors and changes
  ////////////////

  /** Its properties failing validation now, by identifier. */
  @E.state accessor failedFields: ReadonlySet<string> = new Set()

  /** Note a property failing validation, or passing again. */
  @E.untracked
  markFieldFailed(identifier: string, isFailed: boolean) {
    if (this.failedFields.has(identifier) === isFailed) return
    const next = new Set(this.failedFields)
    if (isFailed) next.add(identifier)
    else next.delete(identifier)
    this.failedFields = next
  }

  /** `:state(error)`:  its `error`, a property in it failing validation, or (the section's) a failed load. */
  @E.cssState("error")
  get isError(): boolean {
    return !!this.attributes.error || this.failedFields.size > 0 || this.attributes.state === ERROR
  }

  /** `:state(changed)`:  a property in it holds an edit not saved yet. */
  @E.cssState("changed")
  @E.state
  accessor isChanged = false

  /** `:state(readonly)`:  `readonly`. */
  @E.cssState("readonly")
  get isReadOnly(): boolean {
    const readonly = this.attributes.readonly
    return readonly != null && readonly !== "false"
  }

  /** `state`'s class word on the box (`error`, `info` ...):  shown as an error while one is. */
  protected get extraClass(): string | undefined {
    const state = this.isError ? ERROR : (this.attributes.state ?? undefined)
    return [super.extraClass, GROUP, state].filter(Boolean).join(" ")
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** `output`, at the end of the title bar. */
  protected titleBarEnd(): JSX.Element {
    const output = this.attributes.output
    return (
      <Show when={output || this.slots.hasContent(OUTPUT)}>
        <span class={OUTPUT} part={OUTPUT}>
          <slot name={OUTPUT}>{output}</slot>
        </span>
      </Show>
    )
  }

  /** `error`, a line first in the content. */
  protected contentStart(): JSX.Element {
    const error = this.attributes.error
    return (
      <Show when={error}>
        <div class={ERROR_LINE} part={ERROR_LINE} role="alert">
          {error}
        </div>
      </Show>
    )
  }
}

/** Class word before the section's noun:  `ui … property-group section`. */
const GROUP = "property-group"

/** The error state's word. */
const ERROR = "error"

/** Its own parts and slot:  plain names (the vocabulary's own;  TypeScript knows only the section's). */
const OUTPUT = "output"
const ERROR_LINE = "error-line"
