import { For, Show } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
// the family barrels, not the leaves:  the lib build then imports `ui-form.js` / `ui-section.js`
// (SIDE EFFECT:  defines the form and section families:  the editor is a form, and draws a section)
import { DOMFormElement, FormBinding, UIForm } from "$/ui/components/ui-form"
import "$/ui/components/ui-section"
import type { formVocabulary } from "$/ui/components/ui-form/UIForm.en"
import { sectionVocabulary } from "$/ui/components/ui-section/UISection.en"
import { PropertyEditorPages, PropertySchemas } from "$/ui/property"
import type { ComponentVocabulary, PropertySchema } from "$/ui/vocabulary"
import { propertyEditorVocabulary } from "./UIPropertyEditor.en"
import { GROUP_TAG, MADE_ATTRIBUTE, MADE_FROM, PROPERTY_TAG, VALUE_FROM_ATTRIBUTE } from "./UIPropertyEditor.types"

import editorCSS from "./UIPropertyEditor.css?inline"

/****************
 * ### `DOMPropertyEditorElement`
 * The DOM element of `<ui-property-editor>`:  a form's (`validate()`, `save()`, `cancel()`, `values` ...),
 * plus the schema its properties read.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMPropertyEditorElement extends DOMFormElement {
  /** The schema it draws from, resolved (`schema`);  each `<ui-property>` reads its own attribute's here. */
  get currentSchema(): PropertySchema | undefined {
    return (this.component as UIPropertyEditor | undefined)?.currentSchema
  }
}

/****************
 * ### `UIPropertyEditor`
 * The component behind `<ui-property-editor>`:  a form of properties, drawn from a SCHEMA.
 *
 * - It IS a `<ui-form>` (it extends `UIForm`):  bound to `value` (a thing, or a list of things), validation,
 *   `apply="on save"` with `save()` / `cancel()`, `validate`.
 *   Its `<ui-property>`s are fields of it, in its light DOM.
 * - It DRAWS a `<ui-section>` in its shadow root, around them, when it has a title:
 *   `label` or `slot="label"` (or their old name, `header`).
 *   - Every section attribute it's given is passed on to the section, and the section's named slots too.
 *   - The section's events (`ui-open` / `ui-close`) come out of it, from the editor.
 * - The SCHEMA (`schema`):  what its properties are.
 *   - A name:  one the page added (`UI.propertyControls.addSchema()`), else a tag's vocabulary (`ui-button`).
 *   - As a property:  a `PropertySchema`, or a component vocabulary.
 *   - Empty (no `<ui-property>` or group in it, and no `source`), it MAKES a `<ui-property>` per attribute,
 *     in the schema's order.
 *     SIDE EFFECT:  writes its light DOM, the made ones marked `data-ui-made`.
 * - Its LAYOUT can come from a saved page (`source`, epic `property-editor` P6):
 *   an editor page's markup (`PropertyEditorPages`), loaded through `UI.sources` (same-origin).
 *   The spell editor hands it a `/spaces/` URL.
 *   - The page's groups and properties come into its light DOM.
 *   - So do the attributes of the page's editor that it doesn't have yet
 *     (as an attribute, or as a property a script set).
 *   - `select`:  only the page's first match of that selector.
 *   - A group's `select`:  that group's own part of the page.
 *   - `ui-loading`, then `ui-loaded`;  a page that doesn't load warns, and nothing changes.
 *   - SIDE EFFECT:  writes its light DOM (marked `data-ui-made="source"`) and its own missing attributes.
 * - When a property is written:  `ui-change` (from the editor and from the property), then the schema's
 *   "on change" rules for it (`UI.propertyControls.rule()`).
 * - Its groups hear about their properties:  `ui-invalid` and `:state(error)` when one fails,
 *   `:state(changed)` while one holds an edit, `ui-success` when a submit or a save passes.
 * - `apply="on save"`:  Save and Cancel under the properties (`part="footer"`).
 * - `readonly`:  every property in it is readonly (read as each connects).
 * - A NESTED editor, made by a property (`as="editor"`), edits that property's thing:  its `value` unless given.
 ****************/
export class UIPropertyEditor extends UIForm {
  // the form's names under the editor's tag, the section's and its own:  TypeScript only knows the form's literals
  @E.proto static vocabulary = propertyEditorVocabulary as unknown as typeof formVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { ...UIForm.prototype.elementSetup.styleSheets, editor: editorCSS },
    DOMElement: DOMPropertyEditorElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The schema
  ////////////////

  /** `schema` as given:  a name, or an object. */
  private get schemaGiven(): unknown {
    return E.Reactive.attributeValue(this, "schema")
  }

  /** The schema its properties read, resolved;  `undefined` while there's none (or the runtime isn't in yet). */
  get currentSchema(): PropertySchema | undefined {
    const given = this.schemaGiven
    if (typeof given === "string") {
      if (!this.isReady) return undefined
      const added = UI.propertyControls.schema(given)
      if (added) return added
      const vocabulary = UI.vocabulary.get(given)
      return vocabulary ? PropertySchemas.fromVocabulary(vocabulary) : undefined
    }
    if (!given || typeof given !== "object" || !("attributes" in given)) return undefined
    return "tag" in given ? PropertySchemas.fromVocabulary(given as ComponentVocabulary) : (given as PropertySchema)
  }

  /** Empty of the author's properties:  make one per attribute of the schema (see the class doc). */
  @E.onChange("currentSchema", "isConnected")
  protected onSchemaChanged(schema: PropertySchema | undefined, isConnected: boolean) {
    if (!isConnected || this.holdsOwnProperties || this.attributes.source) return
    this.removeMadeProperties(MADE_FROM.schema)
    for (const spec of schema?.attributes ?? []) {
      const property = document.createElement(PROPERTY_TAG)
      property.setAttribute("name", spec.name)
      property.setAttribute(MADE_ATTRIBUTE, MADE_FROM.schema)
      this.domElement.append(property)
    }
  }

  /** The author laid out properties (or groups) of their own:  any element child it didn't make. */
  private get holdsOwnProperties(): boolean {
    return [...this.domElement.children].some((child) => !child.hasAttribute(MADE_ATTRIBUTE) && !child.slot)
  }

  /**
   * Take away every property it made from `from` (its schema, or its source page).
   * - SIDE EFFECT:  writes its light DOM.
   */
  @E.untracked
  private removeMadeProperties(from: string) {
    for (const child of [...this.domElement.children]) if (child.getAttribute(MADE_ATTRIBUTE) === from) child.remove()
  }

  ////////////////
  // ## Its layout from a page (`source`)
  ////////////////

  /** Load the layout page as `source` or `select` changes, while connected (see the class doc). */
  @E.onChange("sourceUrl", "sourceSelector", "isConnected")
  protected onSourceChanged(url: string | undefined, selector: string | undefined, isConnected: boolean) {
    if (!url || !isConnected || isServer) return
    let isCurrent = true
    void this.loadLayout(url, selector, () => isCurrent)
    return () => {
      isCurrent = false
    }
  }

  /** `source`. */
  get sourceUrl(): string | undefined {
    return this.attributes.source ?? undefined
  }

  /** `select`. */
  get sourceSelector(): string | undefined {
    return this.attributes.select ?? undefined
  }

  /**
   * Fetch the page at `url` and take its layout, unless `isCurrent()` says it's no longer wanted.
   * - NEVER throws:  a page that doesn't load warns.
   */
  @E.untracked
  private async loadLayout(url: string, selector: string | undefined, isCurrent: () => boolean) {
    this.send(OWN.loading, { source: url })
    try {
      await UI.load()
      const { text } = await UI.sources.load(url)
      if (!isCurrent()) return
      const page = new DOMParser().parseFromString(text, "text/html")
      const root = selector ? page.querySelector(selector) : (PropertyEditorPages.editorIn(page) ?? page.body)
      if (!root) {
        E.Warnings.warn("<ui-property-editor>", `${url} has nothing matching \`${selector}\``)
        return
      }
      this.takeLayout(root, page)
      this.send(OWN.loaded, { source: url, content: text })
    } catch (error) {
      E.Warnings.warn("<ui-property-editor>", `can't load its layout from ${url}:`, error)
    }
  }

  /**
   * Take `root`'s children as its layout (and, a page's editor, the attributes it doesn't have);
   * then fill each group that has a `select` and nothing in it from `page`.
   * - SIDE EFFECT:  writes its light DOM and its attributes.
   */
  private takeLayout(root: Element, page: Document) {
    this.removeMadeProperties(MADE_FROM.source)
    if (root.localName === this.domElement.localName) {
      for (const { name, value } of root.attributes) {
        // not over one it has, as an attribute or as a property (`schema` set by a script)
        const own = (this.domElement as unknown as Record<string, unknown>)[E.camelCase(name)]
        if (!this.domElement.hasAttribute(name) && own == null) this.domElement.setAttribute(name, value)
      }
    }
    for (const child of root.children) {
      const made = document.importNode(child, true)
      made.setAttribute(MADE_ATTRIBUTE, MADE_FROM.source)
      this.domElement.append(made)
    }
    for (const group of this.domElement.querySelectorAll(`${GROUP_TAG}[select]`)) {
      if (group.children.length) continue
      const part = page.querySelector(group.getAttribute("select")!)
      for (const child of part?.children ?? []) group.append(document.importNode(child, true))
    }
  }

  ////////////////
  // ## A nested editor's thing
  ////////////////

  /** The property a nested editor edits the thing of (`data-value-from`, set by the property that made it). */
  private get valueFrom(): string | undefined {
    return this.attributes[VALUE_FROM_ATTRIBUTE] ?? undefined
  }

  /** What it's bound to:  `value`, else (nested) the thing its property holds, in the scope around it. */
  get boundValue(): unknown {
    const own = this.value
    if (own !== undefined || !this.valueFrom) return own
    const around = this.domElement.parentElement
    return around ? FormBinding.read(FormBinding.scopeAround(around), this.valueFrom) : undefined
  }

  /** Bound:  there's a thing (or things) to edit. */
  get isBound(): boolean {
    return FormBinding.isObject(this.boundValue)
  }

  /** Hold `boundValue` as the scope its properties bind to (over the form's `value`). */
  onMount() {
    const result = super.onMount()
    FormBinding.hold(this.domElement, () => this.boundValue)
    return result
  }

  ////////////////
  // ## The section around it
  ////////////////

  /** Which of its named slots have light-DOM content:  `slot="label"`, `slot="output"` ... */
  readonly slots = new E.SlotContent(this.domElement)

  /** It has a title, so it draws a section:  `label` or `slot="label"`, or their old name, `header`. */
  get hasTitle(): boolean {
    const { label, header } = this.attributes
    return !!label || !!header || [OWN.label, OWN.header].some((name) => this.slots.hasContent(this.slotForName(name)))
  }

  /** The section attributes it was given, raw, to pass on. */
  private get sectionAttributes(): Record<string, string> {
    const passed: Record<string, string> = {}
    for (const name of SECTION_ATTRIBUTES) {
      const value = this.attributes[name]
      if (value != null) passed[name] = value
    }
    return passed
  }

  /** A section attribute isn't a class word of the form's box:  the section draws it. */
  protected classValue(name: E.AttributeName<typeof formVocabulary>): unknown {
    if (SECTION_ATTRIBUTES.has(name)) return undefined
    return super.classValue(name)
  }

  ////////////////
  // ## States
  ////////////////

  /** `:state(readonly)`:  `readonly`. */
  @E.cssState("readonly")
  get isReadOnly(): boolean {
    return this.attributes.readonly != null && this.attributes.readonly !== "false"
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        part={`${this.partForName(OWN.editor)} ${this.partForName(OWN.form)}`}
        inert={this.disabled || this.loading}
        aria-busy={this.loading ? "true" : undefined}
      >
        <Show when={this.hasTitle} fallback={this.body()}>
          <Dynamic component={SECTION_TAG} {...this.sectionAttributes}>
            <For each={this.forwardedSlots}>{(name) => <slot name={name} slot={name} />}</For>
            {this.outputAndError()}
            {this.body()}
          </Dynamic>
        </Show>
        {this.debugBox()}
      </div>
    )
  }

  /**
   * The section's named slots it has content for, passed on:  only those, so an empty one never hides the
   * section's own text (`label`) or draws an empty box (`actions`).
   */
  private get forwardedSlots(): string[] {
    return FORWARDED_SLOTS.filter((name) => this.slots.hasContent(name))
  }

  /** The properties, then Save and Cancel with `apply="on save"`. */
  private body(): JSX.Element {
    return (
      <>
        <Show when={!this.hasTitle}>{this.outputAndError()}</Show>
        <slot />
        <Show when={this.apply === ON_SAVE}>
          <div class={FOOTER} part={this.partForName(OWN.footer)}>
            <Dynamic component={BUTTON_TAG} primary="" onClick={() => this.save()}>
              {this.translationForKey(OWN.save)}
            </Dynamic>
            <Dynamic component={BUTTON_TAG} onClick={() => this.cancel()}>
              {this.translationForKey(OWN.cancel)}
            </Dynamic>
          </div>
        </Show>
      </>
    )
  }

  /** Its `output` (in the title bar's actions) and `error` (a line under the title). */
  private outputAndError(): JSX.Element {
    const output = this.attributes.output
    const error = this.attributes.error
    return (
      <>
        <Show when={output || this.slots.hasContent(this.slotForName(OWN.output))}>
          <span class={OUTPUT} part={this.partForName(OWN.output)} slot={this.hasTitle ? ACTIONS_SLOT : undefined}>
            <slot name={this.slotForName(OWN.output)}>{output}</slot>
          </span>
        </Show>
        <Show when={error}>
          <div class={ERROR_LINE} part={this.partForName(OWN.errorLine)} role="alert">
            {error}
          </div>
        </Show>
      </>
    )
  }

  ////////////////
  // ## Its properties and groups hear what happened
  ////////////////

  /** A property was written:  `ui-change` from the editor and the property, then its "on change" rules. */
  protected onWritten({ control, name, value, things }: WrittenProperty) {
    const property = control.closest(PROPERTY_TAG)
    property?.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { name, value }, bubbles: false }))
    this.send(OWN.change, { name, value, things })
    const spec = this.currentSchema?.attributes.find((candidate) => candidate.name === name)
    for (const ruleName of spec?.onChange ?? []) {
      const rule = UI.propertyControls.rule(ruleName)
      if (!rule) {
        E.Warnings.warn("<ui-property-editor>", `no rule \`${ruleName}\`:  add it with UI.propertyControls.addRule()`)
        continue
      }
      try {
        rule({ things, property: spec!, value })
      } catch (error) {
        E.Warnings.warn("<ui-property-editor>", `rule \`${ruleName}\` failed:`, error)
      }
    }
  }

  /** A field was checked:  its group shows the error state, and hears `ui-invalid`. */
  protected onFieldChecked(field: { identifier: string; controls: Element[] }, messages: readonly string[]) {
    const group = field.controls[0]?.closest(GROUP_TAG) as DOMGroupLike | null
    if (!group) return
    group.markFieldFailed?.(field.identifier, messages.length > 0)
    if (messages.length) {
      group.dispatchEvent(
        new CustomEvent(INVALID_EVENT, { detail: { field: field.identifier, errors: messages }, bubbles: false })
      )
    }
  }

  /** Held edits came or went:  each property and group says whether it holds one. */
  protected onHeldChanged() {
    const held = new Set(this.heldControls)
    const properties = new Set<Element>()
    const groups = new Set<Element>()
    for (const control of held) {
      const property = control.closest(PROPERTY_TAG)
      if (property) properties.add(property)
      const group = control.closest(GROUP_TAG)
      if (group) groups.add(group)
    }
    for (const property of this.domElement.querySelectorAll(PROPERTY_TAG)) {
      ;(property as PropertyLike).markChanged?.(properties.has(property))
    }
    for (const group of this.domElement.querySelectorAll(GROUP_TAG)) {
      ;(group as DOMGroupLike).markChanged?.(groups.has(group))
    }
  }

  /** A submit or a save passed:  each group hears `ui-success`. */
  protected onSucceeded() {
    for (const group of this.domElement.querySelectorAll(GROUP_TAG)) {
      group.dispatchEvent(new CustomEvent(SUCCESS_EVENT, { detail: { values: this.values }, bubbles: false }))
    }
  }
}

/** The section's attributes the editor passes on (all but those the editor has of its own). */
const SECTION_ATTRIBUTES = new Set(
  // with their old names, which the section reads too (`header` for `label` ...)
  sectionVocabulary.attributes
    .flatMap((spec) => [spec.name as string, ...((spec as { aliases?: readonly string[] }).aliases ?? [])])
    .filter((name) => !["source", "select", "size", "inverted", "loading", "disabled"].includes(name))
)

/** The section's named slots the editor passes on. */
const FORWARDED_SLOTS = sectionVocabulary.slots.map((slot) => slot.name as string).filter(Boolean)

/** What a property's write tells the editor. */
type WrittenProperty = { control: Element; name: string; value: unknown; things: readonly object[] }

/** What the editor calls on a group's DOM element. */
type DOMGroupLike = HTMLElement & {
  markFieldFailed?(identifier: string, isFailed: boolean): void
  markChanged?(isChanged: boolean): void
}

/** What the editor calls on a property's DOM element. */
type PropertyLike = Element & { markChanged?(isChanged: boolean): void }

/**
 * The editor's own names (and the section's it uses), typed for `partForName()` and its kin:
 * TypeScript knows only the form's literals (the vocabulary's cast, above), so each is `never` to it.
 */
const OWN = {
  editor: "editor",
  form: "form",
  footer: "footer",
  output: "output",
  errorLine: "error-line",
  label: "label",
  header: "header",
  save: "save",
  cancel: "cancel",
  change: "ui-change",
  loading: "ui-loading",
  loaded: "ui-loaded"
} as unknown as Record<string, never>

/** The section it draws, and its buttons. */
const SECTION_TAG = "ui-section"
const BUTTON_TAG = "ui-button"

/** The section's slot the output goes in:  its title bar's end. */
const ACTIONS_SLOT = "actions"

/** `apply`'s word for held edits. */
const ON_SAVE = "on save"

/** Events it sends on its properties and groups (and on itself). */
const CHANGE_EVENT = "ui-change"
const INVALID_EVENT = "ui-invalid"
const SUCCESS_EVENT = "ui-success"

/** Shadow classes. */
const FOOTER = "footer"
const OUTPUT = "output"
const ERROR_LINE = "error-line"
