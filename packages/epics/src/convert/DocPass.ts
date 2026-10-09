import { parseHTML } from "linkedom"

import type { EpicData, EpicTag } from "$/epics/definitions"
import { Markup, type MarkupContent, type MarkupProblem } from "$/epics/markup"
import { EpicParts } from "$/epics/tool/EpicParts"
import { PART_EXT, PARTS_DIR, PlanParts } from "$/epics/tool/PlanParts"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"

import { ConvertError } from "./convert.types"

/****************
 * ### `DocPass`
 * One pass over ONE plan doc, IN PLACE:  what both passes share -- the first (`Converter`, the old markup =>
 * `<epic-*>`) and the second (`Upgrader`, a converted doc => P14's elements).
 * - holds the doc twice, assembled:  `before`, as it was (the proof's), and `document`, the working copy made over
 * - makes every `<epic-*>` element through `Markup` (`element()`):  the definitions check each attribute
 * - finishes the working copy as the doc's files (`output()`):  validated, split, formatted, read back
 * - Node only (linkedom, oxfmt through `PlanParts.formatHTML()`);  no files:  `ConvertRun` reads and writes them.
 ****************/
export abstract class DocPass {
  /** The epic's name:  its folder in `epics/`. */
  readonly name: string
  /** The working document:  the doc, assembled, made over IN PLACE. */
  readonly document: Document
  /** What the pass did that a reader should know about. */
  readonly notes: string[] = []
  /** Was the input split? */
  readonly wasSplit: boolean

  /** The doc as it was, assembled:  the proof's `before`. */
  protected readonly before: Document

  constructor({ name, before, document, wasSplit }: DocPassProps) {
    this.name = name
    this.before = before
    this.document = document
    this.wasSplit = wasSplit
  }

  /**
   * A new `<tag>` from `data` and `children`, through `Markup.element()`.
   * - throws `ConvertError` naming `source` (the element it's made from) when the definitions refuse the data
   */
  element<T extends EpicTag>(tag: T, data: EpicData<T>, children: MarkupContent, source?: Element): Element {
    try {
      return Markup.element(this.document, tag, data, children)
    } catch (error) {
      throw this.error((error as Error).message, source)
    }
  }

  /** Note what the pass did that a reader should know (text moved, markup kept as it was). */
  note(message: string): void {
    this.notes.push(message)
  }

  /** A `ConvertError` about `element`, in this doc. */
  error(message: string, element?: Element): ConvertError {
    const where = element ? DocPass.describe(element) : undefined
    return new ConvertError(`${this.name}:  ${message}${where ? `  (at ${where})` : ""}`, {
      cause: { doc: this.name, where }
    })
  }

  ////////////////
  // ## The files
  ////////////////

  /**
   * The working document as the doc's files:  validated, split (`EpicParts`), each file formatted as `vp fmt` would,
   * and read back as a reader of the files would (`after`, for the proof).
   * - `problems`:  what `Markup.validate()` found, in the document and in the files read back (none allowed)
   * - changes `document` (split, ampersands escaped):  call it last
   */
  protected async output(): Promise<PassOutput> {
    const { document } = this
    const problems = Markup.validate(document).map(describeProblem)
    const docName = `${this.name}.plan.html`
    PlanMarkup.escapeAmpersands(document)
    const rawParts = new EpicParts(document).split({ docName })
    const skeleton = await PlanParts.formatHTML(docName, PlanMarkup.serialize(document))
    const parts = new Map<string, string>()
    for (const [id, text] of rawParts) parts.set(id, await PlanParts.formatHTML(`${PARTS_DIR}/${id}${PART_EXT}`, text))
    const after = DocPass.reassembled(skeleton, parts, problems)
    return { skeleton, parts, problems: [...new Set(problems)], after }
  }

  /**
   * The written files read back:  the skeleton parsed, checked, its parts checked as their hosts' children and put
   * back.  Adds what `Markup.validate()` finds to `problems`.
   * - STATIC:  reads strings, as a reader of the files would
   */
  private static reassembled(skeleton: string, parts: Map<string, string>, problems: string[]): Document {
    const document = parseHTML(skeleton).document as unknown as Document
    problems.push(...Markup.validate(document).map(describeProblem))
    for (const [id, text] of parts) {
      const host = document.getElementById(id)
      if (!host) {
        problems.push(`parts/${id}${PART_EXT}:  no host #${id} in the skeleton`)
        continue
      }
      const fragment = parseHTML(`<template>${text}</template>`).document.querySelector("template")!
        .content as unknown as DocumentFragment
      problems.push(
        ...Markup.validate(fragment, { as: host }).map((it) => `parts/${id}${PART_EXT}:  ${describeProblem(it)}`)
      )
    }
    const missing = new EpicParts(document).assemble((id) => parts.get(id))
    for (const id of missing) problems.push(`#${id}'s part is missing`)
    problems.push(...Markup.validate(document).map(describeProblem))
    return document
  }

  /**
   * `element` in a few words:  `<ui-section id="phases">`.
   * - STATIC:  a format, for any element
   */
  static describe(element: Element): string {
    const key = ["id", "class", "header"].find((name) => element.hasAttribute(name))
    return key ? `<${element.localName} ${key}="${element.getAttribute(key)}">` : `<${element.localName}>`
  }
}

/** `DocPass`'s props:  the doc twice, assembled. */
export type DocPassProps = {
  /** The epic's name. */
  name: string
  /** The doc as it was:  the proof's `before`, never changed. */
  before: Document
  /** A second copy, made over IN PLACE. */
  document: Document
  /** Was it split on disk? */
  wasSplit: boolean
}

/** A doc's files, made from its working document (`DocPass.output()`). */
export type PassOutput = {
  /** The skeleton, formatted. */
  skeleton: string
  /** The part files, formatted:  id => text, in page order. */
  parts: Map<string, string>
  /** What `Markup.validate()` found:  ANY is a failed conversion. */
  problems: string[]
  /** The files read back, assembled:  the proof's `after`. */
  after: Document
}

/** A validation problem, one line. */
function describeProblem(problem: MarkupProblem): string {
  return `${problem.kind}:  ${problem.where} ${problem.message}`
}
