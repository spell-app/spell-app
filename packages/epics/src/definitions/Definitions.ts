import { epicAnswerVocabulary } from "$/epics/components/epic-answer/epic-answer.vocabulary.en"
import { epicMoreVocabulary } from "$/epics/components/epic-answer/epic-more.vocabulary.en"
import { epicReplyVocabulary } from "$/epics/components/epic-answer/epic-reply.vocabulary.en"
import { epicChoicesVocabulary } from "$/epics/components/epic-choices/epic-choices.vocabulary.en"
import { epicOptionVocabulary } from "$/epics/components/epic-choices/epic-option.vocabulary.en"
import { epicCommitVocabulary } from "$/epics/components/epic-commit/epic-commit.vocabulary.en"
import { epicEventVocabulary } from "$/epics/components/epic-event/epic-event.vocabulary.en"
import { epicItemVocabulary } from "$/epics/components/epic-item/epic-item.vocabulary.en"
import { epicOriginalVocabulary } from "$/epics/components/epic-original/epic-original.vocabulary.en"
import { epicVersionVocabulary } from "$/epics/components/epic-original/epic-version.vocabulary.en"
import { epicOverviewVocabulary } from "$/epics/components/epic-overview/epic-overview.vocabulary.en"
import { epicPageVocabulary } from "$/epics/components/epic-page/epic-page.vocabulary.en"
import { epicFieldVocabulary } from "$/epics/components/epic-phase/epic-field.vocabulary.en"
import { epicPhaseVocabulary } from "$/epics/components/epic-phase/epic-phase.vocabulary.en"
import { epicUpdatedVocabulary } from "$/epics/components/epic-phase/epic-updated.vocabulary.en"
import { epicSectionVocabulary } from "$/epics/components/epic-section/epic-section.vocabulary.en"
import { epicUpdateVocabulary } from "$/epics/components/epic-update/epic-update.vocabulary.en"

import { Formats, type EpicAttributeSpec, type EpicTag, type EpicVocabulary } from "./definitions.types"

/****************
 * ### `Definitions`
 * Every `<epic-*>` element's description, by tag:  its vocabulary, as data.
 * - Imports each `<tag>.vocabulary.en.ts` straight from its family folder:  PURE DATA, never the family's barrel,
 *   so loading this defines no element and touches no DOM -- node-safe (the tool, the converter, the tests).
 * - STATIC:  one registry, nothing per instance.
 * - A new tag:  `spell dev pack element epics <tag>` (or a sub-tag's files by hand), then its line in `all`;
 *   `Definitions.test.ts` fails on a vocabulary file it doesn't list.
 ****************/
export class Definitions {
  /** Every tag => its vocabulary, in page order (outermost first). */
  static readonly all = {
    "epic-page": epicPageVocabulary,
    "epic-overview": epicOverviewVocabulary,
    "epic-section": epicSectionVocabulary,
    "epic-phase": epicPhaseVocabulary,
    "epic-field": epicFieldVocabulary,
    "epic-updated": epicUpdatedVocabulary,
    "epic-item": epicItemVocabulary,
    "epic-choices": epicChoicesVocabulary,
    "epic-option": epicOptionVocabulary,
    "epic-answer": epicAnswerVocabulary,
    "epic-more": epicMoreVocabulary,
    "epic-reply": epicReplyVocabulary,
    "epic-original": epicOriginalVocabulary,
    "epic-version": epicVersionVocabulary,
    "epic-commit": epicCommitVocabulary,
    "epic-event": epicEventVocabulary,
    "epic-update": epicUpdateVocabulary
  } as const

  /** Every tag, in `all`'s order. */
  static get tags(): EpicTag[] {
    return Object.keys(this.all) as EpicTag[]
  }

  /** Whether `tag` is one of ours. */
  static has(tag: string): tag is EpicTag {
    return Object.hasOwn(this.all, tag)
  }

  /** `tag`'s vocabulary;  `undefined` for a tag that isn't ours. */
  static of(tag: string): EpicVocabulary | undefined {
    return this.has(tag) ? this.all[tag] : undefined
  }

  /** `tag`'s attribute whose camelCase KEY is `key` (`reviewAs` => `review-as`);  `undefined` if it has none. */
  static attribute(tag: EpicTag, key: string): EpicAttributeSpec | undefined {
    return this.all[tag].attributes.find((spec: EpicAttributeSpec) => this.keyOf(spec) === key)
  }

  /**
   * `spec`'s key in `EpicData`:  its name in camelCase (`review-as` => `reviewAs`), as in an element's `this.attrs`.
   * - NOT `spec.property`, the host's JS property:  `id` and `title` take `epicId` / `epicTitle` there, so they
   *   don't shadow the platform's own (the fork refuses that), but data says `id` and `title`.
   * - NOTE: a private copy of `$/util`'s `camelCase()`:  that barrel drags spell's utilities into the pack, and
   *   `$/ui/util` isn't node-safe through `$/ui/core`.
   */
  static keyOf(spec: EpicAttributeSpec): string {
    return spec.name.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase())
  }

  ////////////////
  // ## Values
  ////////////////

  /**
   * What's wrong with attribute text `text` for `spec`, in a few words;  `undefined` when it's fine.
   * - `boolean`:  Spell UI's spellings (`""`, `true`, `yes`, `false`, `no`)
   * - `number`:  a decimal number
   * - `values`:  one of them;  `format`:  matches it (`Formats`)
   */
  static valueProblem(spec: EpicAttributeSpec, text: string): string | undefined {
    if (spec.kind === "boolean") return BOOLEAN_TEXT.test(text) ? undefined : "isn't a boolean (`true`, `false`)"
    if (spec.kind === "number") return NUMBER_TEXT.test(text) ? undefined : "isn't a number"
    if (Array.isArray(spec.values) && !spec.values.includes(text)) {
      return `isn't one of its values (${spec.values.map((value) => `\`${value}\``).join(", ")})`
    }
    if (spec.format && !Formats[spec.format].test(text)) return `isn't a well-formed ${spec.format}`
    return undefined
  }

  /**
   * Attribute text `text` as `spec`'s typed value:  `boolean`, `number`, else the text.
   * - NEVER throws:  a bad value parses as best it can (`NaN`);  `valueProblem()` says what's wrong.
   */
  static parse(spec: EpicAttributeSpec, text: string): string | number | boolean {
    if (spec.kind === "boolean") return !FALSE_TEXT.test(text)
    if (spec.kind === "number") return Number(text)
    return text
  }

  /**
   * Typed value `value` as `spec`'s attribute text:  `true` => `""`, a number => its digits.
   * - `undefined` / `false` => `undefined`:  no attribute.
   * - throws `TypeError` when `value`'s type isn't `spec`'s kind (`"yes"` for a boolean), or its text has a
   *   `valueProblem()`
   */
  static text(spec: EpicAttributeSpec, value: unknown): string | undefined {
    if (value === undefined || value === false) return undefined
    const expected = spec.kind === "boolean" || spec.kind === "number" ? spec.kind : "string"
    if (typeof value !== expected) {
      throw new TypeError(`Definitions.text():  \`${spec.name}\` takes a ${expected}, not \`${JSON.stringify(value)}\``)
    }
    const text = value === true ? "" : String(value as string | number)
    const problem = this.valueProblem(spec, text)
    if (problem) throw new TypeError(`Definitions.text():  \`${spec.name}="${text}"\` ${problem}`)
    return text
  }
}

/** Spell UI's boolean spellings:  presence / `""` / `true` / `yes` ~== true;  `false` / `no` ~== false. */
const BOOLEAN_TEXT = /^(|true|yes|false|no)$/

/** The boolean spellings meaning false. */
const FALSE_TEXT = /^(false|no)$/

/** A decimal number. */
const NUMBER_TEXT = /^-?\d+(\.\d+)?$/
