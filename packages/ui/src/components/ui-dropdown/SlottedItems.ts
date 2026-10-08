import { onSettled } from "solid-js"
import { isServer } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { itemVocabulary } from "$/ui/components/ui-item/UIItem.vocabulary.en"

/****************
 * ### `SlottedItems`
 * The options a dropdown's light-DOM `<ui-item>` children describe, as reactive `MenuEntry`s:
 * shared by `<ui-dropdown>` and `<ui-select>`.
 * - Read on connect, and on every change to the DOM element's subtree (a `MutationObserver`:  children,
 *   attributes, text).  That covers what `slotchange` would, and the attribute and text edits it wouldn't.
 * - Plain items become `MenuOption`s:  `value` (default `text`), `text` (default the text content), `description`,
 *   `icon`, `image`, `flag`, `disabled`, `selected` (or its alias `active`, as `UIItem` reads it).
 *   The dropdown renders them in ITS shadow root, because the listbox must share a tree with the combobox for
 *   `aria-activedescendant`.
 * - RICH items (element children) keep their markup:  the item gets a generated `slot` name and the dropdown
 *   projects it into its menu row, so the content stays live (listeners, framework-rendered children).
 *   NOTE: that writes a `slot` attribute onto the author's element.  Text for search / labels is its text content.
 * - Option objects are cached per element and reused while unchanged, so keyed `<For>` keeps their rows.
 ****************/
export class SlottedItems {
  /** Entries in document order;  tracked. */
  @E.state accessor entries: readonly E.MenuEntry[] = []

  /** Generated slot name of each rich option. */
  readonly slots = new WeakMap<E.MenuOption, string>()

  /** The dropdown's DOM element. */
  private readonly domElement: E.DOMElement

  /** Last entry per element, reused while equal. */
  private readonly cache = new WeakMap<Element, E.MenuEntry>()

  /** Counter for generated slot names. */
  private counter = 0

  /** Read `domElement`'s items now, and again on every change to its subtree once settled. */
  constructor(domElement: E.DOMElement) {
    this.domElement = domElement
    this.entries = this.read()
    onSettled(() => {
      const observer = new MutationObserver(() => (this.entries = this.read()))
      observer.observe(domElement, { childList: true, subtree: true, attributes: true, characterData: true })
      this.entries = this.read()
      return () => observer.disconnect()
    })
  }

  /** Every item child (`<ui-item>`, or a translated alias of it), read now. */
  private read(): E.MenuEntry[] {
    const entries: E.MenuEntry[] = []
    for (const element of this.domElement.children) {
      const definition = E.UIComponent.definitions.get(element.localName)
      if (element.localName !== itemVocabulary.tag && definition?.vocabulary !== itemVocabulary) continue
      entries.push(this.entry(element, definition))
    }
    return entries
  }

  /** Entry for one `<ui-item>`, reusing the cached object when nothing changed. */
  private entry(element: Element, definition: E.ElementDefinition | undefined): E.MenuEntry {
    const read = <N extends E.AttributeName<typeof itemVocabulary>>(name: N) =>
      SlottedItems.valueFor(element, definition, name)
    const type = read("type")
    const isRich = element.children.length > 0
    const text = (read("text") as string | undefined) ?? element.textContent?.trim() ?? ""
    let next: E.MenuEntry
    if (type === "header" || type === "divider") next = { type, text } satisfies E.MenuSeparator
    else {
      next = {
        value: (read("value") as string | undefined) ?? text,
        text,
        description: read("description") as string | undefined,
        // `""` is a bare `icon`:  an item has no icon of its own to default to
        icon: (read("icon") as string | undefined) || undefined,
        image: read("image"),
        flag: read("flag"),
        disabled: read("disabled") as boolean,
        selected: (read("selected") as boolean) || E.Converters.boolean(element.getAttribute(UIT.ACTIVE), UIT.ACTIVE)
      }
    }
    const cached = this.cache.get(element)
    const entry = cached && SlottedItems.isSameEntry(cached, next) ? cached : next
    this.cache.set(element, entry)
    if (isRich && !("type" in entry)) {
      let slot = this.slots.get(entry)
      if (!slot) this.slots.set(entry, (slot = `${SLOT_PREFIX}${++this.counter}`))
      if (element.slot !== slot) element.slot = slot
    }
    return entry
  }

  /**
   * Converted value of item attribute `name`:  the (already converted) property once the item has upgraded,
   * else its attribute, converted here.
   * - On a server, always the attribute:  linkedom has no `:defined`,
   *   and the items' stand-in DOM elements are built after the dropdown's.
   * - Static:  pure, it needs no instance.
   */
  private static valueFor(element: Element, definition: E.ElementDefinition | undefined, name: string): unknown {
    if (!definition) {
      const spec: E.AttributeSpec = itemVocabulary.attributes.find((attribute) => attribute.name === name)!
      const raw = element.getAttribute(spec.name)
      if (spec.kind === "keyOnly") return E.Converters.boolean(raw, spec.name)
      if (spec.kind === "icon") return E.Converters.icon(raw, spec.default)
      return raw ?? undefined
    }
    const attribute = definition.attribute(name)
    if (!isServer && element.matches(":defined")) {
      return (element as unknown as Record<string, unknown>)[attribute.property]
    }
    return definition.convert(attribute, element.getAttribute(attribute.attribute))
  }

  /**
   * Shallow equality of two entries.
   * - STATIC:  pure, needs no instance.
   */
  private static isSameEntry(a: E.MenuEntry, b: E.MenuEntry): boolean {
    const keys = Object.keys(b) as (keyof E.MenuEntry)[]
    return keys.length === Object.keys(a).length && keys.every((key) => a[key] === b[key])
  }
}

/** Prefix of generated slot names for rich items. */
const SLOT_PREFIX = "ui-item-"
