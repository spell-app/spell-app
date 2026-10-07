import { Definitions, type AnyEpicData, type EpicData, type EpicTag, type EpicVocabulary } from "$/epics/definitions"

import { TEXT_NODE, type MarkupContent, type MarkupProblem, type ValidateOptions } from "./markup.types"
import { MarkupCheck } from "./MarkupCheck"

/****************
 * ### `Markup`
 * Reads and writes a plan doc's `<epic-*>` markup THROUGH THE DEFINITIONS:  data in attributes, prose in children.
 * - Make an element from data (`element()`), read its data back (`read()`), change it (`set()`), put a child where
 *   its parent's content model lists it (`place()`), check a whole doc or a part (`validate()`).
 * - Plain DOM, no globals:  works on linkedom documents (node:  the tool, the converter) and the browser's DOM
 *   alike.  Never defines an element:  `$/epics/definitions` is data.
 * - STATIC:  nothing to keep between calls.
 * - Data is keyed by camelCase name (`reviewAs` for `review-as`):  `EpicData<tag>`.
 ****************/
export class Markup {
  /**
   * A new `<tag>` in `document`, its attributes from `data`, then `children` appended.
   * - Strings in `children` are MARKUP (`MarkupContent`).
   * - throws `TypeError` for an unknown tag, an attribute `tag` doesn't have, a bad value, or a required one
   *   missing (a `"or slot"` one may come as a slotted child)
   */
  static element<T extends EpicTag>(document: Document, tag: T, data: EpicData<T>, children?: MarkupContent): Element {
    const vocabulary = this.vocabularyOf(tag, "element")
    const element = document.createElement(tag)
    this.set(element, data)
    if (children !== undefined) this.append(element, children)
    const missing = MarkupCheck.missingAttributes(element, vocabulary).map((spec) => `\`${spec.name}\``)
    if (missing.length) throw new TypeError(`Markup.element():  <${tag}> needs ${missing.join(", ")}`)
    return element
  }

  /**
   * `element`'s data:  every attribute its vocabulary lists that it carries, typed (`EpicData`);  absent ones left
   * out.
   * - NEVER throws on a bad value (it reads as best it can:  `NaN`);  `validate()` reports it.
   * - throws `TypeError` when `element` isn't an `<epic-*>` we define
   */
  static read<T extends EpicTag>(element: Element): EpicData<T> {
    const vocabulary = this.vocabularyOf(element.localName, "read")
    const data: AnyEpicData = {}
    for (const spec of vocabulary.attributes) {
      const text = element.getAttribute(spec.name)
      if (text !== null) data[Definitions.keyOf(spec)] = Definitions.parse(spec, text)
    }
    return data as EpicData<T>
  }

  /**
   * Set `element`'s attributes from `data`, by camelCase key;  `undefined` or `false` removes one.  Returns
   * `element`.
   * - throws `TypeError`, changing nothing, for a key its vocabulary doesn't list, a value of the wrong type, or one
   *   outside its `values` / `format`
   */
  static set<T extends EpicTag>(element: Element, data: Partial<EpicData<T>>): Element {
    const tag = element.localName
    const vocabulary = this.vocabularyOf(tag, "set")
    const changes: [name: string, text: string | undefined][] = []
    for (const [key, value] of Object.entries(data)) {
      const spec = Definitions.attribute(tag as EpicTag, key)
      if (!spec) {
        const keys = vocabulary.attributes.map((it) => Definitions.keyOf(it))
        throw new TypeError(`Markup.set():  <${tag}> has no attribute \`${key}\`;  it takes:  ${keys.join(", ")}`)
      }
      try {
        changes.push([spec.name, Definitions.text(spec, value)])
      } catch (error) {
        throw new TypeError(`Markup.set():  <${tag}>:  ${(error as Error).message.replace(/^.*?:  /, "")}`)
      }
    }
    const rank = this.rankIn(vocabulary)
    for (const [name, text] of changes.toSorted(([a], [b]) => rank(a) - rank(b))) {
      if (text === undefined) element.removeAttribute(name)
      else element.setAttribute(name, text)
    }
    if (this.prependsAttributes(element.ownerDocument)) this.orderAttributes(element, rank)
    return element
  }

  /**
   * Append `content` to `element`:  nodes as they are, strings parsed as markup.  Returns `element`.
   * - Not checked:  `validate()` checks children.
   */
  static append(element: Element, content: MarkupContent): Element {
    for (const piece of typeof content === "string" || !Array.isArray(content) ? [content] : content) {
      if (typeof piece === "string") element.insertAdjacentHTML("beforeend", piece)
      else element.append(piece as Node)
    }
    return element
  }

  /**
   * Put `node` into `parent` where its content model lists it (`childOrder: "listed"`):  after every child of its
   * own kind or an earlier one, before the first of a later one;  at the end when the model has no order.  Returns
   * `parent`.
   * - matched as `validate()` matches (`MarkupCheck.matches()`):  slotted children (a title) and blank text are never
   *   in the way;  blank text isn't placed
   * - Not checked:  `validate()` checks children.
   */
  static place(parent: Element, node: Node): Element {
    if (isBlank(node)) return parent
    const vocabulary = Definitions.of(parent.localName)
    if (!vocabulary || vocabulary.childOrder !== "listed") return this.append(parent, node)
    const specs = MarkupCheck.childSpecs(vocabulary, parent).filter((spec) => !spec.slot)
    const rank = (child: Node) => specs.findIndex((spec) => MarkupCheck.matches(spec, child))
    const own = rank(node)
    const next = Array.from(parent.childNodes).find((child) => !isBlank(child) && rank(child) > own)
    if (next) next.before(node)
    else parent.append(node)
    return parent
  }

  /**
   * What's wrong with `root`'s `<epic-*>` markup:  unknown tags and attributes, bad values, missing attributes,
   * children out of place or order, wrong or duplicate ids.  Empty:  all well.
   * - `root`:  a document (its `<epic-page>`), an `<epic-*>` element (checked as itself), or with `as`, a part's body
   *   (checked as its host's children)
   * - NEVER throws:  every problem is reported.
   */
  static validate(root: ParentNode, options?: ValidateOptions): MarkupProblem[] {
    return new MarkupCheck().run(root, options)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `tag`'s vocabulary;  throws `TypeError`, naming `method`, for a tag we don't define. */
  private static vocabularyOf(tag: string, method: string): EpicVocabulary {
    const vocabulary = Definitions.of(tag)
    if (!vocabulary) {
      throw new TypeError(
        `Markup.${method}():  <${tag}> isn't an epic element;  one of:  ${Definitions.tags.join(", ")}`
      )
    }
    return vocabulary
  }

  /** `vocabulary`'s order of attribute names:  its own first, as listed;  any other (`class`, `slot`) after. */
  private static rankIn(vocabulary: EpicVocabulary): (name: string) => number {
    const names = vocabulary.attributes.map((spec) => spec.name)
    return (name) => (names.includes(name) ? names.indexOf(name) : names.length)
  }

  /**
   * Put `element`'s attributes in `rank`'s order, so a file reads `<epic-item id title status ...>` however it was
   * edited.  Only on a DOM that prepends new attributes (`prependsAttributes()`):  a browser appends, and reordering
   * a live element's attributes would re-render it for nothing.
   */
  private static orderAttributes(element: Element, rank: (name: string) => number) {
    const current = Array.from(element.attributes, ({ name, value }) => [name, value] as const)
    const sorted = current.toSorted(([a], [b]) => rank(a) - rank(b))
    if (sorted.every(([name], index) => name === current[index]![0])) return
    for (const [name] of current) element.removeAttribute(name)
    for (const [name, value] of sorted.toReversed()) element.setAttribute(name, value)
  }

  /**
   * Whether `document`'s DOM puts a NEW attribute first.
   * - HACK: linkedom (0.18) does, so a file it writes would list attributes newest first;  probed once per
   *   document, never assumed, in case it stops.
   */
  private static prependsAttributes(document: Document): boolean {
    let prepends = this.prepending.get(document)
    if (prepends === undefined) {
      const probe = document.createElement("div")
      probe.setAttribute("a", "")
      probe.setAttribute("b", "")
      prepends = probe.attributes[0]!.name === "b"
      this.prepending.set(document, prepends)
    }
    return prepends
  }

  /** `prependsAttributes()`' answer, per document. */
  private static readonly prepending = new WeakMap<Document, boolean>()
}

/** Is `node` text holding only whitespace (or nothing)? */
function isBlank(node: Node): boolean {
  return node.nodeType === TEXT_NODE && !node.textContent?.trim()
}
