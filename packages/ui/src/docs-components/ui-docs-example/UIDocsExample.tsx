import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { CODE_SPAN, HeadingLevels } from "$/ui/docs-components/docs-components.types"
import { ExampleSource } from "./ExampleSource"
import { DocsExampleFallback } from "./ui-docs-example.fallback"
import { CODE_PANE_ID, LEVELS, type DocsExampleVocabulary } from "./ui-docs-example.types"
import { docsExampleVocabulary } from "./ui-docs-example.vocabulary.en"

import exampleCSS from "./ui-docs-example.css?inline"

/****************
 * ### `<ui-docs-example>`
 * Fomantic's docs example:  `<section class="ui [bare] [variation] example" part="example">` holding the header row
 * (`<ui-header>` + the code `<ui-button>`), the description, `<ui-segment part="demo">` around the default slot (the
 * live example:  the host's own children) and, while `code` is on, `<ui-segment part="code">` with the markup in a
 * `<ui-code>`.
 * - The markup shown is read ONCE, on first connect (`ExampleSource.of()`):  a `<template>` child, else the page
 *   snapshot the site entry took before any family loaded, else the live children minus runtime attributes.  See
 *   `ExampleSource` for why and its limits.
 * - A `<template>` child is also stamped out live, once, right after it (on a microtask:  never inside this render,
 *   so the stamped elements upgrade under their own owners).
 * - `code` is the open state (auto-controlled, reflected):  the button flips it and fires `ui-toggle { open }`;
 *   `:state(open)` follows it.
 * - A doc-only element (`src/docs-components/`):  its shadow composes other families' widgets, which its barrel
 *   imports.
 ****************/
export class UIDocsExample extends E.UIElement<DocsExampleVocabulary> {
  @E.proto static vocabulary = docsExampleVocabulary
  @E.proto static styles = { "docs-example": exampleCSS }
  @E.proto static Fallback = DocsExampleFallback
  @E.proto static delegatesFocus = false

  /** The markup to show, read once before anything here touches the light DOM. */
  readonly source: string = isServer ? "" : ExampleSource.of(this.host)

  /** Which slots have content:  the description shows only when there is one. */
  readonly slots = new E.SlotContent(this.host)

  /** `code`:  the code pane is open. */
  readonly open = this.controlled("code", false)

  /** A `<template>` child was stamped out live (see the class). */
  readonly isStamped: boolean = !isServer && this.stamp()

  protected override hostStates() {
    return { open: !!this.open.get() }
  }

  render(): JSX.Element {
    return (
      <section class={this.classes()} part={this.part("example")}>
        <div class={HEADING_CLASS}>
          <Show when={this.attrs.header}>
            <ui-header
              part={this.part("header")}
              level={String(HeadingLevels.levelFor(this.attrs.level, LEVELS))}
              size={this.attrs.variation ? "small" : undefined}
            >
              {this.attrs.header}
            </ui-header>
          </Show>
          <ui-button
            part={this.part("toggle")}
            circular=""
            basic=""
            icon={CODE_ICON}
            size={this.attrs.variation ? "mini" : "tiny"}
            aria-label={this.toggleLabel()}
            title={this.toggleLabel()}
            aria-expanded={this.open.get() ? UIT.TRUE : UIT.FALSE}
            aria-controls={CODE_PANE_ID}
            ref={(button: HTMLElement) => button.addEventListener(UIT.CLICK, (event) => this.toggle(event))}
          />
        </div>
        <Show when={this.attrs.description || this.slots.has(this.slot("description"))}>
          <div class={UIT.DESCRIPTION} part={this.part("description")}>
            <slot name={this.slot("description")}>{this.description()}</slot>
          </div>
        </Show>
        <ui-segment
          part={this.part("demo")}
          basic={this.isFramed() ? undefined : ""}
          attached={this.isFramed() ? UIT.TOP : undefined}
        >
          <slot />
        </ui-segment>
        <Show when={this.open.get()}>
          <ui-segment
            id={CODE_PANE_ID}
            part={this.part("code")}
            secondary=""
            attached={this.attrs.bare ? undefined : UIT.BOTTOM}
          >
            <ui-code
              part={this.part("source")}
              language={this.attrs.language || DEFAULT_LANGUAGE}
              copy=""
              prop:content={this.source}
            />
          </ui-segment>
        </Show>
      </section>
    )
  }

  /** Open or close the code pane, as the viewer did with `event`. */
  toggle(event?: Event): void {
    const next = !this.open.get()
    this.open.request(next, () => this.emit("ui-toggle", { open: next, originalEvent: event }))
  }

  /** The live example sits in a frame:  the code is open and the example isn't `bare`. */
  private isFramed(): boolean {
    return !!this.open.get() && !this.attrs.bare
  }

  /** The code button's name:  what a click does. */
  private toggleLabel(): string {
    return this.open.get() ? this.text("hideCode") : this.text("showCode")
  }

  /** The `description` attribute as text, with each backticked span as `<code>`. */
  private description(): (string | JSX.Element)[] {
    const text = this.attrs.description ?? ""
    return text.split(CODE_SPAN).map((piece, index) => (index % 2 ? <code>{piece}</code> : piece))
  }

  /**
   * Stamp a `<template>` child's content out right after it, once;  true if there was one.
   * - On a microtask:  this runs while the element renders, and the new elements must upgrade outside it.
   */
  private stamp(): boolean {
    const template = ExampleSource.template(this.host)
    if (!template) return false
    queueMicrotask(() => template.after(template.content.cloneNode(true)))
    return true
  }
}

/** Class word of the header row:  the title and the code button. */
const HEADING_CLASS = "heading"

/** The icon of the code button:  Fomantic's `code` icon. */
const CODE_ICON = "code"

/** `language` when unset (the vocabulary's default):  the source is markup. */
const DEFAULT_LANGUAGE = "html"
