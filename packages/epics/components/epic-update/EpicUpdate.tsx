import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { PlanDates } from "$/epics/dates"
// the fold pieces every `<epic-*>` fold shares:  their files, not `epic-item`'s barrel (which would define it here)
import { FOLDS, Fold } from "$/epics/components/epic-item/Fold"

import { epicUpdateVocabulary } from "./EpicUpdate.en"

import updateCSS from "./EpicUpdate.css?inline"
import foldCSS from "$/epics/components/epic-item/Fold.css?inline"
import tooltipCSS from "$/epics/components/epic-item/Tooltip.css?inline"

/****************
 * ### `EpicUpdate`
 * The component behind `<epic-update>`:  an UPDATE, in one of two shapes.
 * - A BLOCK (`:state(block)`):  it has a `summary`, an `at` or children (what changed).
 *   - Its title row (Owen, 2026-10-11):  the fold chevron, **Update**: <summary>, and the date at the right,
 *     as a comment thread's message shows its time:  muted, tabular, on the first line's right, the title's later
 *     lines running the full width under it (narrow screens keep their room).
 *   - What changed under the title row.
 *   - Orange, our colour for "changed since you looked":  a faint orange ground and outline.
 *   - Folds by its title row (Owen, 2026-10-08:  everything in a section box folds):
 *     open to start with;  page state, never written;  folded, `hidden="until-found"`.
 *   - Where it sits is the doc's business (`PLAN-DOC.md`, "Updates"):
 *     a phase's plan change at the end of its description, an update to prose right after the block it changed.
 *   - Owen comments on it with its own bullhorn (`BlockAnchors.js`, kind `update`).
 * - A bare LABEL:  no summary, no date, no children.
 *   An orange `UPDATE` inline, on an item changed while a phase is active (`phase 3 done` removes it).
 *   Its tooltip names the phase:  `Changed during P3`.
 * - Its own family, so its look changes in one place (Owen:  "so we can restyle easily").
 ****************/
export class EpicUpdate extends E.UIComponent<typeof epicUpdateVocabulary> {
  @E.proto static vocabulary = epicUpdateVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-tooltip": tooltipCSS, "epic-fold-button": foldCSS, "epic-update": updateCSS },
    // a container:  a click on its text must not jump to the fold button
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** A block's open or folded state:  open to start with. */
  readonly fold = new Fold(() => true)

  /** A block, unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.isBlock && this.fold.isOpen()
  }

  /** Drawn as a block:  it has a summary, a date or what changed (not a bare label). */
  @E.cssState("block")
  get isBlock(): boolean {
    return Boolean(this.summary || this.at) || this.hasBody
  }

  /** Has it what changed (children)?  Follows its children;  never on a server. */
  @E.watches({ childList: true, characterData: true, subtree: true })
  get hasBody(): boolean {
    return !isServer && EpicUpdate.hasContent(this.domElement)
  }

  /** `at`, as drawn:  `10/11/26 14:30` (`PlanDates`). */
  get date(): string {
    return PlanDates.format(this.at)
  }

  /** The date's tooltip:  `at` as written, then the phase under way then. */
  get dateTip(): string | undefined {
    if (!this.at) return undefined
    const during = this.phase === undefined ? "" : ` · ${this.translationForKey("during", { phase: this.phase })}`
    return `${this.at}${during}`
  }

  render(): JSX.Element {
    return (
      <Show when={this.isBlock} fallback={this.renderLabel()}>
        {this.renderBlock()}
      </Show>
    )
  }

  /** The block:  its title row (chevron, `Update: <summary>`, the date), what changed under it. */
  private renderBlock(): JSX.Element {
    return (
      <div class={[this.rootClass, BLOCK]} part={this.partForName("base")}>
        <div ref={this.fold.heading} class={[HEAD, { [FOLDS]: this.hasBody }]} part={this.partForName("header")}>
          <Show when={this.hasBody}>
            {this.fold.button({
              controls: BODY_ID,
              labelledBy: TITLE_ID,
              part: this.partForName("toggle"),
              tips: { fold: this.translationForKey("foldTip"), unfold: this.translationForKey("unfoldTip") }
            })}
          </Show>
          {/* the date floats right of the title's FIRST line only:  the lines under it run the full width */}
          <div class={WORDS}>
            <Show when={this.date}>
              <span class={WHEN}>
                <time class={TIME} part={this.partForName("time")} datetime={this.at} title={this.dateTip}>
                  {this.date}
                </time>
              </span>
            </Show>
            <span id={TITLE_ID} class={TITLE} part={this.partForName("title")}>
              <b>{this.translationForKey("title")}</b>
              <Show when={this.summary}>{(summary) => `: ${summary()}`}</Show>
            </span>
          </div>
        </div>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={BODY}
          part={this.partForName("body")}
          hidden={this.hasBody ? this.fold.hidden() : true}
        >
          <slot />
        </div>
      </div>
    )
  }

  /** The bare label:  an orange `UPDATE`, its phase in its tooltip. */
  private renderLabel(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("base")}>
        <span
          class={LABEL}
          part={this.partForName("label")}
          title={this.phase === undefined ? undefined : this.translationForKey("tip", { phase: this.phase })}
        >
          {this.translationForKey("label")}
        </span>
        <slot />
      </span>
    )
  }

  /** Has `element` any content:  an element, or text that isn't blank? */
  private static hasContent(element: Element): boolean {
    return Array.from(element.childNodes).some(
      (node) => node.nodeType === Node.ELEMENT_NODE || !!node.textContent?.trim()
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicUpdate extends E.AttributeValues<typeof epicUpdateVocabulary> {}

/**
 * Classes of the shadow markup:  the block, its title row, the title's box (the date's float, then the title), the
 * date's float, its title, its date, what changed;  the bare label.
 */
const BLOCK = "block"
const HEAD = "head"
const WORDS = "words"
const WHEN = "when"
const TITLE = "title"
const TIME = "time"
const BODY = "body"
const LABEL = "label"

/** Ids of the shadow markup:  the title (the fold button's name), the box it folds. */
const TITLE_ID = "title"
const BODY_ID = "body"
