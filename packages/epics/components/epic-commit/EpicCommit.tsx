import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, UIElement, UIT } from "$/ui/core"

import { epicCommitVocabulary } from "./epic-commit.vocabulary.en"
import { EpicCommitFallback } from "./epic-commit.fallback"
import {
  HEADING,
  ICON,
  LINE,
  LINK_TARGET,
  PAGE_TAG,
  SHA,
  SHORT_SHA,
  type EpicCommitVocabulary
} from "./epic-commit.types"

import commitCSS from "./epic-commit.css?inline"

/****************
 * ### `<epic-commit>`
 * One commit of a phase or an item:  its short sha (a link to the commit, made from the page's `<epic-page repo>`),
 * then what it did (its children).
 * - The first of a run of commits carries the run's heading, `Commits:` with the git icon (`:host(:first-of-type)`
 *   in its sheet);  the lines sit under the heading's text.
 * - Hidden until the page's git toggle shows every commit (`--epic-commits-display`, from `<epic-page>`), or an
 *   item shows its own (the item sets the same property).
 * - The repo is read as it connects:  a commit moved under another page takes that page's.
 ****************/
export class EpicCommit extends UIElement<EpicCommitVocabulary> {
  @proto static vocabulary = epicCommitVocabulary
  @proto static styles = { "epic-commit": commitCSS }
  @proto static Fallback = EpicCommitFallback

  /** The heading's icon. */
  readonly glyph = new IconGlyph(this, () => "code branch")

  /** Its link, from the page's `repo`;  `undefined` without one. */
  readonly href = createMemo(() => {
    const repo = this.connected.get() ? this.host.closest(PAGE_TAG)?.getAttribute("repo") : undefined
    return repo && this.attrs.sha ? `${repo.replace(/\/$/, "")}/commit/${this.attrs.sha}` : undefined
  })

  /** The sha, as shown. */
  readonly short = createMemo(() => (this.attrs.sha ?? "").slice(0, SHORT_SHA))

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <div class={HEADING} part={this.part("heading")}>
          <span class={ICON} aria-hidden={UIT.TRUE}>
            {this.glyph.svg()}
          </span>
          <b>{this.text("heading")}</b>
        </div>
        <div class={LINE}>
          <Show
            when={this.href()}
            fallback={
              <code class={SHA} part={this.part("sha")}>
                {this.short()}
              </code>
            }
          >
            <a
              class={SHA}
              part={this.part("sha")}
              href={this.href()}
              target={LINK_TARGET}
              title={this.text("open", { sha: this.short() })}
            >
              {this.short()}
            </a>
          </Show>{" "}
          <slot />
        </div>
      </div>
    )
  }
}
