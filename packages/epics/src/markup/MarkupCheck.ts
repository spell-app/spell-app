import {
  Definitions,
  FLOW,
  ItemLetters,
  OVERVIEW_PART,
  OVERVIEW_PART_ID,
  REPORT,
  SectionIds,
  type AttributeTest,
  type ChildSpec,
  type EpicAttributeSpec,
  type EpicVocabulary
} from "$/epics/definitions"

import {
  ELEMENT_NODE,
  EPIC_PREFIX,
  GLOBAL_ATTRIBUTE_PREFIXES,
  GLOBAL_ATTRIBUTES,
  TEXT_NODE,
  type MarkupProblem,
  type ProblemKind,
  type ValidateOptions
} from "./markup.types"

/****************
 * ### `MarkupCheck`
 * One run of `Markup.validate()`:  walks a doc (or a part's fragment) and collects what's wrong with its `<epic-*>`
 * markup against the definitions -- attributes, content models, ids.
 * - Plain DOM, no globals (`nodeType`, `localName`, never `instanceof`):  works on linkedom documents in node and
 *   on the browser's DOM alike.
 * - Collects, NEVER throws:  a doc with a hundred problems reports a hundred.
 * - Prose (`FLOW`) isn't checked, only searched for `<epic-*>` elements, which must be `flow` ones there.
 ****************/
export class MarkupCheck {
  /** What's wrong, in document order (roughly:  an element's own problems before its children's). */
  readonly problems: MarkupProblem[] = []

  /** Every id seen so far => its first element:  a second one is a `duplicate id`. */
  private readonly ids = new Map<string, Element>()

  /** Check `root`:  a document, a fragment, or an element (an `<epic-*>` is checked as itself). */
  run(root: ParentNode, { as }: ValidateOptions = {}): MarkupProblem[] {
    if (as) this.checkChildren(root, typeof as === "string" ? { tag: as } : { tag: as.localName, host: as })
    else if (isElement(root) && isEpic(root.localName)) this.checkElement(root)
    else this.checkTopLevel(root)
    this.checkIds(root)
    return this.problems
  }

  ////////////////
  // ## Elements
  ////////////////

  /** Outside any `<epic-*>`:  only `<epic-page>` may stand alone;  part files are checked `as` their host. */
  private checkTopLevel(node: ParentNode) {
    for (const child of elementChildren(node)) {
      if (!isEpic(child.localName)) this.checkTopLevel(child)
      else if (child.localName === "epic-page") this.checkElement(child)
      else if (!Definitions.has(child.localName)) this.add("unknown tag", child, "no definition describes it")
      else {
        this.add("not allowed here", child, "is outside `<epic-page>`;  check a part's body with `{ as: <its host> }`")
      }
    }
  }

  /**
   * Check `<epic-*>` `element`:  its attributes, its children, then theirs.
   * - `parent`:  the element it's checked in, when that isn't its DOM parent (a part's body, checked `as` its host)
   */
  private checkElement(element: Element, parent: Element | undefined = element.parentElement ?? undefined) {
    const vocabulary = Definitions.of(element.localName)
    if (!vocabulary) return this.add("unknown tag", element, "no definition describes it")
    this.checkAttributes(element, vocabulary)
    this.checkSemantics(element, parent)
    this.checkChildren(element, { tag: element.localName, host: element })
  }

  /** Every attribute known and well-formed, every required one there. */
  private checkAttributes(element: Element, vocabulary: EpicVocabulary) {
    for (const { name, value } of Array.from(element.attributes)) {
      const spec = vocabulary.attributes.find((it) => it.name === name)
      if (spec) {
        const problem = Definitions.valueProblem(spec, value)
        if (problem) this.add("bad value", element, `\`${name}="${value}"\` ${problem}`)
      } else if (!isGlobalAttribute(name)) {
        const names = vocabulary.attributes.map((it) => it.name).join(", ")
        this.add("unknown attribute", element, `has no attribute \`${name}\`;  it takes:  ${names || "none"}`)
      }
    }
    for (const spec of MarkupCheck.missingAttributes(element, vocabulary)) {
      const orSlot = spec.required === "or slot" ? ` (or a child with \`slot="${spec.name}"\`)` : ""
      this.add("missing attribute", element, `needs \`${spec.name}\`${orSlot}`)
    }
  }

  /**
   * What the content models can't say:  fixed section ids, item letters per section, an Overview sub-section's
   * title, the chosen option.
   */
  private checkSemantics(element: Element, parent: Element | undefined) {
    const id = element.getAttribute("id")
    if (element.localName === "epic-section") {
      const kind = element.getAttribute("kind") ?? ""
      const fixed = SectionIds[kind as keyof typeof SectionIds]
      if (id !== null && fixed && id !== fixed)
        this.add("wrong id", element, `a \`${kind}\` section's id is \`${fixed}\``)
      if (kind === OVERVIEW_PART && id !== null && !OVERVIEW_PART_ID.test(id))
        this.add("wrong id", element, "an Overview sub-section's id is `o<N>`")
      const titled = TITLED_KINDS[kind]
      if (titled && !element.hasAttribute("title") && !slotted(element, "title")) {
        this.add("missing attribute", element, `${titled} needs \`title\` (or a \`slot="title"\` child)`)
      }
    }
    if (element.localName === "epic-item" && id !== null) {
      const section = parent
      const letter = ItemLetters[section?.getAttribute("kind") as keyof typeof ItemLetters]
      if (section?.localName === "epic-section" && letter && !id.startsWith(letter)) {
        this.add("wrong id", element, `items in a \`${section.getAttribute("kind")}\` section are \`${letter}<N>\``)
      }
    }
    const chosen = element.localName === "epic-choices" ? element.getAttribute("chosen") : null
    if (chosen !== null) {
      const letters = elementChildren(element).map((option) => option.getAttribute("letter"))
      if (!letters.includes(chosen)) this.add("bad value", element, `\`chosen="${chosen}"\` names no option`)
    }
  }

  ////////////////
  // ## Children
  ////////////////

  /**
   * Check `parent`'s children against `tag`'s content model, then check each child.
   * - `host`:  the element whose attributes `when` reads;  none (a bare `as` tag):  every spec applies.
   */
  private checkChildren(parent: ParentNode, { tag, host }: { tag: string; host?: Element }) {
    const vocabulary = Definitions.of(tag)
    if (!vocabulary) return
    const specs = MarkupCheck.childSpecs(vocabulary, host)
    const counts = new Map<ChildSpec, number>()
    const ordered = vocabulary.childOrder === "listed"
    const subject = host ?? (isElement(parent) ? parent : undefined)
    let position = 0
    for (const child of Array.from(parent.childNodes)) {
      if (!isSignificant(child)) continue
      if (isElement(child) && isEpic(child.localName) && !Definitions.has(child.localName)) {
        this.add("unknown tag", child, "no definition describes it")
        continue
      }
      const candidates = specs.filter((spec) => MarkupCheck.matches(spec, child))
      if (!candidates.length) {
        this.add(
          "not allowed here",
          placeOf(child, subject),
          `${describe(child)} isn't allowed in <${tag}>;  ${allowed(specs)}`
        )
      } else {
        const unslotted = candidates.filter((spec) => !spec.slot)
        let spec = candidates[0]!
        if (ordered && unslotted.length) {
          spec = unslotted.find((it) => specs.indexOf(it) >= position) ?? unslotted[0]!
          if (specs.indexOf(spec) < position) {
            this.add("out of order", placeOf(child, subject), `${describe(child)} is out of order;  ${order(specs)}`)
          }
          position = Math.max(position, specs.indexOf(spec))
        }
        counts.set(spec, (counts.get(spec) ?? 0) + 1)
        if (spec.max !== undefined && counts.get(spec)! === spec.max + 1) {
          this.add("too many", placeOf(child, subject), `<${tag}> takes at most ${spec.max} of:  ${spec.description}`)
        }
      }
      if (isElement(child)) this.checkChild(child, subject)
    }
    for (const spec of specs) {
      if ((spec.min ?? 0) > (counts.get(spec) ?? 0) && subject) {
        this.add("too few", subject, `<${tag}> needs at least ${spec.min} of:  ${spec.description}`)
      }
    }
  }

  /** A child element of `parent`:  an `<epic-*>` is checked whole;  prose is searched for `<epic-*>`s. */
  private checkChild(child: Element, parent: Element | undefined) {
    if (isEpic(child.localName)) this.checkElement(child, parent)
    else this.checkProse(child)
  }

  /** Inside prose, an `<epic-*>` must be a `flow` one (`<epic-update>`). */
  private checkProse(prose: Element) {
    for (const child of elementChildren(prose)) {
      if (!isEpic(child.localName)) this.checkProse(child)
      else if (!Definitions.has(child.localName)) this.add("unknown tag", child, "no definition describes it")
      else if (Definitions.of(child.localName)!.flow) this.checkElement(child)
      else
        this.add(
          "not allowed here",
          child,
          `is inside prose (<${prose.localName}>);  it belongs directly in its parent`
        )
    }
  }

  ////////////////
  // ## Ids
  ////////////////

  /** Every id once, across the whole root. */
  private checkIds(root: ParentNode) {
    const elements = Array.from(root.querySelectorAll("[id]"))
    if (isElement(root) && root.hasAttribute("id")) elements.unshift(root)
    for (const element of elements) {
      const id = element.getAttribute("id")!
      if (!this.ids.has(id)) this.ids.set(id, element)
      else this.add("duplicate id", element, `\`${id}\` is also ${describe(this.ids.get(id)!)}'s`)
    }
  }

  ////////////////
  // ## Shared with `Markup`
  ////////////////

  /** `vocabulary`'s required attributes `element` lacks (a `"or slot"` one is there through a slotted child too). */
  static missingAttributes(element: Element, vocabulary: EpicVocabulary): EpicAttributeSpec[] {
    return vocabulary.attributes.filter(
      (spec) =>
        spec.required &&
        !element.hasAttribute(spec.name) &&
        !(spec.required === "or slot" && slotted(element, spec.name))
    )
  }

  /**
   * `vocabulary`'s child specs that apply in `host`:  those whose `when` its attributes pass;  every one with no
   * host (a bare `as` tag).
   */
  static childSpecs(vocabulary: EpicVocabulary, host?: Element): ChildSpec[] {
    return vocabulary.children.filter((spec) => !spec.when || !host || passes(spec.when, host))
  }

  /**
   * Whether `child` is a child `spec` describes:  its slot, then its tag (or prose, for `FLOW`) and `where`.
   * - prose:  text, any element that isn't an `<epic-*>`, or a `flow` one (`<epic-update>`)
   */
  static matches(spec: ChildSpec, child: Node): boolean {
    if ((spec.slot ?? "") !== slotOf(child)) return false
    if (spec.tag === FLOW) return isProse(child)
    if (!isElement(child) || child.localName !== spec.tag) return false
    return !spec.where || passes(spec.where, child)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Record a problem. */
  private add(kind: ProblemKind, element: Element, message: string) {
    this.problems.push({ kind, element, where: describe(element), message })
  }
}

/** Whether `node` is an element. */
function isElement(node: Node | ParentNode): node is Element {
  return (node as Node).nodeType === ELEMENT_NODE
}

/** Whether `tag` is an `<epic-*>` tag, ours or not. */
function isEpic(tag: string): boolean {
  return tag.startsWith(EPIC_PREFIX)
}

/** `node`'s child elements. */
function elementChildren(node: ParentNode): Element[] {
  return Array.from(node.children)
}

/** An element, or text that isn't only whitespace;  comments never count. */
function isSignificant(node: Node): boolean {
  return isElement(node) || (node.nodeType === TEXT_NODE && /\S/.test(node.textContent ?? ""))
}

/** Prose:  text, any element that isn't an `<epic-*>`, or a `flow` one. */
function isProse(node: Node): boolean {
  if (!isElement(node)) return true
  return !isEpic(node.localName) || Boolean(Definitions.of(node.localName)?.flow)
}

/** `element`'s slot, `""` for the default one. */
function slotOf(node: Node): string {
  return isElement(node) ? (node.getAttribute("slot") ?? "") : ""
}

/** Whether a child of `element` carries `slot="<name>"`. */
function slotted(element: Element, name: string): boolean {
  return elementChildren(element).some((child) => child.getAttribute("slot") === name)
}

/** Whether `element`'s attribute passes `test`. */
function passes(test: AttributeTest, element: Element): boolean {
  return test.values.includes(element.getAttribute(test.attribute) ?? "")
}

/** Where to report a problem with `child`:  itself, or its parent for text. */
function placeOf(child: Node, parent: Element | undefined): Element {
  return isElement(child) ? child : (parent ?? (child.parentNode as Element))
}

/** `node` in a few words:  `<epic-item id="q3">`, `<epic-section kind="phases">`, `text "..."`. */
function describe(node: Node): string {
  if (!isElement(node)) return `text "${(node.textContent ?? "").trim().slice(0, 30)}"`
  const key = ["id", "kind", "name", "letter", "sha"].find((name) => node.hasAttribute(name))
  return key ? `<${node.localName} ${key}="${node.getAttribute(key)}">` : `<${node.localName}>`
}

/** What a content model allows, for a message. */
function allowed(specs: readonly ChildSpec[]): string {
  if (!specs.length) return "it takes no children"
  return `it takes:  ${specs.map(childName).join(", ")}`
}

/** The order a listed content model wants, for a message. */
function order(specs: readonly ChildSpec[]): string {
  return `the order is:  ${specs
    .filter((spec) => !spec.slot)
    .map(childName)
    .join(", ")}`
}

/** One child spec, for a message:  `<epic-field name="goal">`, `prose`, `prose in slot "title"`. */
function childName(spec: ChildSpec): string {
  const name =
    spec.tag === FLOW
      ? "prose"
      : `<${spec.tag}${spec.where ? ` ${spec.where.attribute}="${spec.where.values.join("|")}"` : ""}>`
  return spec.slot ? `${name} in slot "${spec.slot}"` : name
}

/** The section kinds whose title is their own, never drawn => what to call one in a message. */
const TITLED_KINDS: Record<string, string> = {
  [OVERVIEW_PART]: "an Overview sub-section",
  [REPORT]: "a report"
}

/** Whether attribute `name` is one any element may carry. */
function isGlobalAttribute(name: string): boolean {
  return GLOBAL_ATTRIBUTES.includes(name) || GLOBAL_ATTRIBUTE_PREFIXES.some((prefix) => name.startsWith(prefix))
}
