import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { CODE_SPAN, HeadingLevels, type HeadingBounds } from "$/ui/docs-components/docs-components.types"
import { ExampleSource } from "./ExampleSource"
import { docsExampleVocabulary } from "./UIDocsExample.en"

import exampleCSS from "./UIDocsExample.css?inline"

/****************
 * ### `UIDocsExample`
 * The component behind `<ui-docs-example>`:  Fomantic's docs example block.
 * A header and description, its own children LIVE, and their source in a code pane the code button shows and hides.
 *
 * - Its shadow DOM:  `<section class="ui [bare] [variation] example" part="example">` holding
 *   - the header row (`<ui-header>` + the code `<ui-button>`), then the description
 *   - `<ui-segment part="demo">` around the default slot (the live example:  the element's own children)
 *   - while `code` is on, `<ui-segment part="code">`, with the markup in a `<ui-code>`.
 * - The markup shown is read ONCE, on first connect (`ExampleSource.of()`):  a `<template>` child,
 *   else the page snapshot the site entry took before any family loaded,
 *   else the live children minus runtime attributes.  See `ExampleSource` for why, and its limits.
 * - A `<template>` child is also stamped out live, once,
 *   right after it (on a microtask:  never inside this render, so the stamped elements upgrade under their own owners).
 * - `code` is the open state (auto-controlled, reflected):  the button flips it and fires `ui-toggle { open }`;
 *   `:state(open)` follows it.
 * - A doc-only element (`src/docs-components/`):  its shadow DOM is built of other families' widgets,
 *   which its barrel imports.
 ****************/
export class UIDocsExample extends E.UIComponent<typeof docsExampleVocabulary> {
  @E.proto static vocabulary = docsExampleVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "docs-example": exampleCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The markup to show, read once before anything here touches the light DOM. */
  readonly sourceMarkup: string = isServer ? "" : ExampleSource.of(this.domElement)

  /** Which slots have content:  the description shows only when there is one. */
  readonly slots = new E.SlotContent(this.domElement)

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    // after `sourceMarkup` is read:  the fields initialize first
    if (!isServer) this.stamp()
  }

  ////////////////
  // ## The code pane
  ////////////////

  /** `code`:  the code pane is open. */
  @E.cssState("open")
  @E.controlled("code")
  accessor isCodeOpen = false

  /** Open or close the code pane, as the viewer did with `event`. */
  toggle(event?: Event): void {
    const next = !this.isCodeOpen
    this.requestChange("isCodeOpen", next, () => this.send("ui-toggle", { open: next, originalEvent: event }))
  }

  /** The code button's name:  what a click does. */
  private get toggleLabel(): string {
    return this.isCodeOpen ? this.translationForKey("hideCode") : this.translationForKey("showCode")
  }

  /** The live example sits in a frame:  the code is open and the example isn't `bare`. */
  private get demoIsFramed(): boolean {
    return this.isCodeOpen && !this.bare
  }

  ////////////////
  // ## The example
  ////////////////

  /** The `description` attribute as text, with each backticked span as `<code>`. */
  private get descriptionWithCode(): (string | JSX.Element)[] {
    const text = this.description ?? ""
    return text.split(CODE_SPAN).map((piece, index) => (index % 2 ? <code>{piece}</code> : piece))
  }

  /**
   * Stamp a `<template>` child's content out right after it, once, if there is one.
   * - On a microtask:  this runs while the element renders, and the new elements must upgrade outside it.
   */
  private stamp() {
    const template = ExampleSource.template(this.domElement)
    if (template) queueMicrotask(() => template.after(template.content.cloneNode(true)))
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <section class={this.rootClass} part={this.partForName("example")}>
        <div class={HEADING_CLASS}>
          <Show when={this.header}>
            <ui-header
              part={this.partForName("header")}
              level={String(HeadingLevels.levelFor(this.level, LEVELS))}
              size={this.variation ? "small" : undefined}
            >
              {this.header}
            </ui-header>
          </Show>
          <ui-button
            part={this.partForName("toggle")}
            circular=""
            basic=""
            icon={CODE_ICON}
            size={this.variation ? "mini" : "tiny"}
            aria-label={this.toggleLabel}
            title={this.toggleLabel}
            aria-expanded={this.isCodeOpen ? "true" : "false"}
            aria-controls={CODE_PANE_ID}
            ref={(button: HTMLElement) => button.addEventListener("click", (event) => this.toggle(event))}
          />
        </div>
        <Show when={this.description || this.slots.hasContent(this.slotForName("description"))}>
          <div class={UIT.DESCRIPTION} part={this.partForName("description")}>
            <slot name={this.slotForName("description")}>{this.descriptionWithCode}</slot>
          </div>
        </Show>
        <ui-segment
          part={this.partForName("demo")}
          basic={this.demoIsFramed ? undefined : ""}
          attached={this.demoIsFramed ? UIT.TOP : undefined}
        >
          <slot />
        </ui-segment>
        <Show when={this.isCodeOpen}>
          <ui-segment
            id={CODE_PANE_ID}
            part={this.partForName("code")}
            secondary=""
            attached={this.bare ? undefined : UIT.BOTTOM}
          >
            <ui-code
              part={this.partForName("source")}
              language={this.language || DEFAULT_LANGUAGE}
              copy=""
              prop:content={this.sourceMarkup}
            />
          </ui-segment>
        </Show>
      </section>
    )
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIDocsExample extends E.AttributeValues<typeof docsExampleVocabulary> {}

/** Class word of the header row:  the title and the code button. */
const HEADING_CLASS = "heading"

/** The icon of the code button:  Fomantic's `code` icon. */
const CODE_ICON = "code"

/** `language` when unset (the vocabulary's default):  the source is markup. */
const DEFAULT_LANGUAGE = "html"

/** Id of the code pane inside the shadow root, for the button's `aria-controls`. */
const CODE_PANE_ID = "code"

/** `level`:  any heading level;  unset, `4`:  Fomantic's examples are `h4`. */
const LEVELS: HeadingBounds = { min: 1, max: 6, fallback: 4 }
