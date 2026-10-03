import { onSettled, type Accessor } from "solid-js"
import { isServer } from "@solidjs/web"

import {
  Cell,
  Converters,
  type AttributeName,
  type AttributeSpec,
  type ElementDefinition,
  type MenuEntry,
  type MenuOption,
  type MenuSeparator,
  type UIHost,
  UIElement,
  UIT
} from "$/ui/core"

import { itemVocabulary } from "$/ui/components/ui-item/ui-item.vocabulary.en"
import { SLOT_PREFIX } from "./ui-dropdown.types"

/**
 * The options a dropdown's light-DOM `<ui-item>` children describe, as a signal of `MenuEntry`s.
 * - Read on connect and on every mutation of the host's subtree (`MutationObserver`:  children, attributes,
 *   text) -- that also covers what `slotchange` would, and attribute / text edits it wouldn't.
 * - Plain items become `MenuOption`s:  `value` (default `text`), `text` (default the text content), `description`,
 *   `icon`, `image`, `flag`, `disabled`, `selected` (or its alias `active`, as `UIItem` reads it).  The dropdown renders them in ITS shadow root, because
 *   the listbox must share a tree with the combobox for `aria-activedescendant`.
 * - RICH items (element children) keep their markup:  the item gets a generated `slot` name and the dropdown
 *   projects it into its menu row, so the content stays live (listeners, framework-rendered children).
 *   NOTE: that writes a `slot` attribute onto the author's element.  Text for search / labels is its text content.
 * - Option objects are cached per element and reused while unchanged, so keyed `<For>` keeps their rows.
 */
export class SlottedItems {
  /** Entries in document order. */
  readonly entries: Accessor<readonly MenuEntry[]>

  /** Generated slot name of each rich option. */
  readonly slots = new WeakMap<MenuOption, string>()

  /** The dropdown. */
  private readonly host: UIHost

  /** Writable `entries`. */
  private readonly cell: Cell<readonly MenuEntry[]>

  /** Last entry per element, reused while equal. */
  private readonly cache = new WeakMap<Element, MenuEntry>()

  /** Counter for generated slot names. */
  private counter = 0

  constructor(host: UIHost) {
    this.host = host
    this.cell = new Cell<readonly MenuEntry[]>(this.read())
    this.entries = this.cell.get
    onSettled(() => {
      const observer = new MutationObserver(() => this.cell.set(this.read()))
      observer.observe(host, { childList: true, subtree: true, attributes: true, characterData: true })
      this.cell.set(this.read())
      return () => observer.disconnect()
    })
  }

  /** Every item child (`<ui-item>`, or a translated alias of it), read now. */
  private read(): MenuEntry[] {
    const entries: MenuEntry[] = []
    for (const element of this.host.children) {
      const definition = UIElement.definitions.get(element.localName)
      if (element.localName !== itemVocabulary.tag && definition?.vocabulary !== itemVocabulary) continue
      entries.push(this.entry(element, definition))
    }
    return entries
  }

  /** Entry for one `<ui-item>`, reusing the cached object when nothing changed. */
  private entry(element: Element, definition: ElementDefinition | undefined): MenuEntry {
    const read = <N extends AttributeName<typeof itemVocabulary>>(name: N) =>
      SlottedItems.value(element, definition, name)
    const type = read("type")
    const rich = element.children.length > 0
    const text = (read("text") as string | undefined) ?? element.textContent?.trim() ?? ""
    let next: MenuEntry
    if (type === "header" || type === "divider") next = { type, text } satisfies MenuSeparator
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
        selected: (read("selected") as boolean) || Converters.boolean(element.getAttribute(UIT.ACTIVE), UIT.ACTIVE)
      }
    }
    const cached = this.cache.get(element)
    const entry = cached && SlottedItems.same(cached, next) ? cached : next
    this.cache.set(element, entry)
    if (rich && !("type" in entry)) {
      let slot = this.slots.get(entry)
      if (!slot) this.slots.set(entry, (slot = `${SLOT_PREFIX}${++this.counter}`))
      if (element.slot !== slot) element.slot = slot
    }
    return entry
  }

  /**
   * Converted value of item attribute `name`:  the (already converted) property once the item has upgraded,
   * else its attribute, converted here.
   * - On a server, always the attribute:  linkedom has no `:defined`, and the items' stand-in hosts are built after
   *   the dropdown's.
   */
  private static value(element: Element, definition: ElementDefinition | undefined, name: string): unknown {
    if (!definition) {
      const spec: AttributeSpec = itemVocabulary.attributes.find((attribute) => attribute.name === name)!
      const raw = element.getAttribute(spec.name)
      if (spec.kind === "keyOnly") return Converters.boolean(raw, spec.name)
      if (spec.kind === "icon") return Converters.icon(raw, spec.default)
      return raw ?? undefined
    }
    const attribute = definition.attribute(name)
    if (!isServer && element.matches(":defined")) {
      return (element as unknown as Record<string, unknown>)[attribute.property]
    }
    return definition.convert(attribute, element.getAttribute(attribute.attribute))
  }

  /** Shallow equality of two entries. */
  private static same(a: MenuEntry, b: MenuEntry): boolean {
    const keys = Object.keys(b) as (keyof MenuEntry)[]
    return keys.length === Object.keys(a).length && keys.every((key) => a[key] === b[key])
  }
}
