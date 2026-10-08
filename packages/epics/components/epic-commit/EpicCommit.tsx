import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicCommitVocabulary } from "./EpicCommit.en"

import commitCSS from "./EpicCommit.css?inline"

/****************
 * ### `EpicCommit`
 * The component behind `<epic-commit>`:  one commit of a phase or an item -- its short sha (a link to the commit,
 * made from the page's `<epic-page repo>`), then what it did (its children).
 * - The first of a run of commits carries the run's heading, `Commits:` with the git icon (`:host(:first-of-type)`
 *   in its sheet);  the lines sit under the heading's text.
 * - Hidden until the page's git toggle shows every commit (`--epic-commits-display`, from `<epic-page>`), or an
 *   item shows its own (the item sets the same property).
 * - The repo is read as it connects:  a commit moved under another page takes that page's.
 ****************/
export class EpicCommit extends E.UIComponent<typeof epicCommitVocabulary> {
  @E.proto static vocabulary = epicCommitVocabulary
  @E.proto static styleSheets = { "epic-commit": commitCSS }

  /** The heading's icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => "code branch" })

  /** Its link, from the page's `repo`;  `undefined` without one. */
  get href(): string | undefined {
    const repo = this.isConnected ? this.domElement.closest(PAGE_TAG)?.getAttribute("repo") : undefined
    return repo && this.sha ? `${repo.replace(/\/$/, "")}/commit/${this.sha}` : undefined
  }

  /** The sha, as shown. */
  get shortSha(): string {
    return (this.sha ?? "").slice(0, SHORT_SHA)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("base")}>
        <div class={HEADING} part={this.partForName("heading")}>
          <span class={ICON} aria-hidden="true">
            {this.glyph.svg}
          </span>
          <b>{this.translationForKey("heading")}</b>
        </div>
        <div class={LINE}>
          <Show
            when={this.href}
            fallback={
              <code class={SHA} part={this.partForName("sha")}>
                {this.shortSha}
              </code>
            }
          >
            <a
              class={SHA}
              part={this.partForName("sha")}
              href={this.href}
              target={LINK_TARGET}
              title={this.translationForKey("open", { sha: this.shortSha })}
            >
              {this.shortSha}
            </a>
          </Show>{" "}
          <slot />
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicCommit extends E.AttributeValues<typeof epicCommitVocabulary> {}

/** How many of the sha's digits show. */
const SHORT_SHA = 7

/** Where a sha's link opens:  one GitHub tab, as today's links. */
const LINK_TARGET = "github"

/** The page around a commit, whose `repo` its link is made from. */
const PAGE_TAG = "epic-page"

/** Classes of the shadow markup. */
const HEADING = "heading"
const LINE = "line"
const SHA = "sha"
const ICON = "icon"
