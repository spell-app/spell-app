// the types-only leaf, as `V`:  `$/ui/api` would bring every element (and Solid's JSX) into a node tool's type check
import type * as V from "$/spell-solid/vocabulary.types"
import { PropertySchemas } from "./PropertySchemas"

/****************
 * ### `PropertyEditorPages`
 * EDITOR PAGES:  a property editor's layout saved as a file of plain markup, `Card.editor.html`
 * (epic `property-editor` P6), which `<ui-property-editor source>` loads as it is.
 *
 * ```html
 * <ui-property-editor schema="Card" header="Card">
 *   <ui-property name="rank" as="buttons"></ui-property>
 *   <ui-property-group header="Other">
 *     <ui-property name="direction"></ui-property>
 *   </ui-property-group>
 * </ui-property-editor>
 * ```
 *
 * - `write()`:  a schema's default page, one property per attribute, in order.
 * - `check()`:  what's wrong with a page, against its schema as it is now.
 *   - a property the page names that the schema dropped
 *   - an attribute of the schema the page doesn't name
 *   - a control (`as`) that no longer fits its type (`select` for a value that has no choices any more)
 * - `fix()`:  the page put right:  dropped properties taken away, new ones added to an "Other" group,
 *   a control that no longer fits back to its type's own.
 * - DOM only, no Solid and no runtime:  a browser's DOM, or linkedom's under node (`spell check`).
 * - STATIC and instance-free:  it keeps nothing between calls.
 ****************/
export class PropertyEditorPages {
  /** The text of `schema`'s default page:  its editor, with one `<ui-property>` per attribute. */
  static write(schema: V.PropertySchema, document: Document): string {
    const editor = document.createElement(EDITOR_TAG)
    editor.setAttribute("schema", schema.name)
    editor.setAttribute("header", schema.label ?? schema.name)
    for (const spec of schema.attributes) editor.append(PropertyEditorPages.property(document, spec.name))
    return PropertyEditorPages.text(editor)
  }

  /** The editor in a page's markup:  its `<ui-property-editor>`, else `undefined`. */
  static editorIn(root: ParentNode): Element | undefined {
    return root.querySelector(EDITOR_TAG) ?? undefined
  }

  /** What's wrong with the page whose editor is `editor`, against `schema`;  `[]` when nothing is. */
  static check(editor: Element, schema: V.PropertySchema): PageProblem[] {
    const problems: PageProblem[] = []
    const named = new Set<string>()
    for (const property of editor.querySelectorAll(PROPERTY_TAG)) {
      const name = property.getAttribute("name") ?? ""
      named.add(name.split(".")[0]!)
      const spec = PropertyEditorPages.specFor(schema, name)
      if (!spec) {
        problems.push({ kind: "dropped", name, message: `${schema.name} has no \`${name}\` any more` })
        continue
      }
      const kind = property.getAttribute("as")
      if (kind && !PropertyEditorPages.fits(kind, spec)) {
        const type = PropertySchemas.typeOf(spec)
        problems.push({ kind: "control", name, message: `\`as="${kind}"\` doesn't fit \`${name}\`, a ${type}` })
      }
    }
    for (const spec of schema.attributes) {
      if (named.has(spec.name)) continue
      problems.push({
        kind: "missing",
        name: spec.name,
        message: `${schema.name}'s \`${spec.name}\` isn't on the page`
      })
    }
    return problems
  }

  /**
   * Put the page whose editor is `editor` right, against `schema` (see the class doc);  returns what it did.
   * - SIDE EFFECT:  changes `editor` and what's in it;  `text()` writes it back.
   */
  static fix(editor: Element, schema: V.PropertySchema): PageProblem[] {
    const problems = PropertyEditorPages.check(editor, schema)
    const document = editor.ownerDocument
    for (const problem of problems) {
      const property = editor.querySelector(`${PROPERTY_TAG}[name="${problem.name}"]`)
      if (problem.kind === "dropped") property?.remove()
      else if (problem.kind === "control") property?.removeAttribute("as")
      else PropertyEditorPages.otherGroup(editor).append(PropertyEditorPages.property(document, problem.name))
    }
    return problems
  }

  /**
   * An editor's markup as a page's text:  its start tag, then each child on its own lines, two spaces in.
   * - Built from the elements (`outerHTML`), not from strings;  every element with elements inside it (a group)
   *   on lines of its own, each a level further in.
   */
  static text(editor: Element): string {
    return `${PropertyEditorPages.lines(editor, 0).join("\n")}\n`
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A `<ui-property name>`. */
  private static property(document: Document, name: string): Element {
    const property = document.createElement(PROPERTY_TAG)
    property.setAttribute("name", name)
    return property
  }

  /** The page's "Other" group (`data-other`), made at the end if it has none. */
  private static otherGroup(editor: Element): Element {
    const found = editor.querySelector(`${GROUP_TAG}[${OTHER_ATTRIBUTE}]`)
    if (found) return found
    const group = editor.ownerDocument.createElement(GROUP_TAG)
    group.setAttribute("header", OTHER)
    group.setAttribute(OTHER_ATTRIBUTE, "")
    editor.append(group)
    return group
  }

  /** What `schema` says of `name`;  a dotted name reaches into a nested thing's attributes. */
  private static specFor(schema: V.PropertySchema, name: string): V.AttributeSpec | undefined {
    let attributes: readonly V.AttributeSpec[] | undefined = schema.attributes
    let spec: V.AttributeSpec | undefined
    for (const key of name.split(".")) {
      spec = attributes?.find((candidate) => candidate.name === key)
      attributes = spec?.attributesOf
    }
    return spec
  }

  /** Control kind `kind` fits `spec`:  a kind made for some types takes only those;  any other kind fits. */
  private static fits(kind: string, spec: V.AttributeSpec): boolean {
    const types = KIND_TYPES[kind]
    if (!types) return true
    const type = PropertySchemas.typeOf(spec)
    if (types.includes(type)) return true
    return type === LIST && !!(spec.values ?? spec.choicesFrom) && kind === CHOICE_LIST_KIND
  }

  /**
   * `element`'s lines, `depth` levels in:  one line when it has no element inside it (a property, a button);
   * else its start tag, each child a level further in, and its end tag.
   */
  private static lines(element: Element, depth: number): string[] {
    const indent = INDENT.repeat(depth)
    if (!element.children.length) return [`${indent}${element.outerHTML}`]
    const empty = (element.cloneNode(false) as Element).outerHTML
    const end = `</${element.localName}>`
    const children = [...element.children].flatMap((child) => PropertyEditorPages.lines(child, depth + 1))
    return [`${indent}${empty.slice(0, -end.length)}`, ...children, `${indent}${end}`]
  }
}

/** One thing wrong with a page. */
export type PageProblem = {
  /** `dropped`:  the schema has no such property;  `missing`:  the page doesn't name one;  `control`:  `as` doesn't fit. */
  kind: "dropped" | "missing" | "control"
  /** The property. */
  name: string
  /** What's wrong, in words. */
  message: string
}

/** The family's tags. */
const EDITOR_TAG = "ui-property-editor"
const GROUP_TAG = "ui-property-group"
const PROPERTY_TAG = "ui-property"

/** The group `fix()` adds new properties to, and its marker. */
const OTHER = "Other"
const OTHER_ATTRIBUTE = "data-other"

/** A list's type. */
const LIST = "list"

/** The app's kind for picking several choices:  it fits a list with choices. */
const CHOICE_LIST_KIND = "choices"

/** Built-in control kinds that only fit some value types (any other kind fits any). */
const KIND_TYPES: Record<string, readonly V.ValueType[]> = {
  number: ["number"],
  range: ["number", "choice"],
  select: ["choice"],
  buttons: ["choice"],
  checkbox: ["boolean"],
  toggle: ["boolean"],
  date: ["date"],
  editor: ["thing"]
}

/** One level of a page's indent. */
const INDENT = "  "
