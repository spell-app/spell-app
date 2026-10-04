import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { proto, SlotContent, UIElement } from "$/ui/core"

import { docsExampleVocabulary } from "./ui-docs-example.vocabulary.en"
import { DocsExampleFallback } from "./ui-docs-example.fallback"
import { ExampleSource } from "./ExampleSource"
import {
  CODE_ICON,
  CODE_PANE_ID,
  CODE_SPAN,
  DEFAULT_LANGUAGE,
  DEFAULT_LEVEL,
  MAX_LEVEL,
  MIN_LEVEL,
  type DocsExampleVocabulary
} from "./ui-docs-example.types"

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
export class UIDocsExample extends UIElement<DocsExampleVocabulary> {
  @proto static vocabulary = docsExampleVocabulary
  @proto static styles = { "docs-example": exampleCSS }
  @proto static Fallback = DocsExampleFallback
  @proto static delegatesFocus = false

  /** The markup to show, read once before anything here touches the light DOM. */
  readonly source: string = isServer ? "" : ExampleSource.of(this.host)

  /** Which slots have content:  the description shows only when there is one. */
  readonly slots = new SlotContent(this.host)

  /** `code`:  the code pane is open. */
  readonly open = this.controlled("code", false)

  /** A `<template>` child was stamped out live (see the class). */
  readonly stamped: boolean = !isServer && this.stamp()

  protected override hostStates() {
    return { open: !!this.open.get() }
  }

  render(): JSX.Element {
    return (
      <section class={this.classes()} part={this.part("example")}>
        <div class="heading">
          <Show when={this.attrs.header}>
            <ui-header
              part={this.part("header")}
              level={String(this.level())}
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
            aria-label={this.open.get() ? this.text("hideCode") : this.text("showCode")}
            title={this.open.get() ? this.text("hideCode") : this.text("showCode")}
            aria-expanded={this.open.get() ? "true" : "false"}
            aria-controls={CODE_PANE_ID}
            ref={(button: HTMLElement) => button.addEventListener("click", (event) => this.toggle(event))}
          />
        </div>
        <Show when={this.attrs.description || this.slots.has(this.slot("description"))}>
          <div class="description" part={this.part("description")}>
            <slot name={this.slot("description")}>{this.describe()}</slot>
          </div>
        </Show>
        <ui-segment
          part={this.part("demo")}
          basic={this.framed() ? undefined : ""}
          attached={this.framed() ? "top" : undefined}
        >
          <slot />
        </ui-segment>
        <Show when={this.open.get()}>
          <ui-segment
            id={CODE_PANE_ID}
            part={this.part("code")}
            secondary=""
            attached={this.attrs.bare ? undefined : "bottom"}
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

  /** Open or close the code pane, as the user did with `event`. */
  toggle(event?: Event): void {
    const next = !this.open.get()
    this.open.request(next, () => this.emit("ui-toggle", { open: next, originalEvent: event }))
  }

  /** The live example sits in a frame:  the code is open and the example isn't `bare`. */
  private framed(): boolean {
    return !!this.open.get() && !this.attrs.bare
  }

  /** `level`, clamped to a heading level. */
  private level(): number {
    const level = Math.round(Number(this.attrs.level ?? DEFAULT_LEVEL))
    return Number.isFinite(level) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, level)) : DEFAULT_LEVEL
  }

  /** The `description` attribute as text, with each backticked span as `<code>`. */
  private describe(): (string | JSX.Element)[] {
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
