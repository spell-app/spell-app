import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { messageVocabulary } from "./UIMessage.en"

import messageCSS from "./UIMessage.css?inline"

/****************
 * ### `UIMessage`
 * The component behind `<ui-message>`:  a box of text telling the reader something,
 * with an optional icon, header and close button.
 *
 * - Its shadow DOM is one box, `<div class="ui … message" part="message">`, holding, in order:
 *   the icon box, ALWAYS a `<div class="content" part="content">` (the `header` shorthand, then the default slot),
 *   and the `dismissible` close button.
 *   - It adds the `icon` class (after the noun) while there's an icon (the `icon` shorthand or a slotted
 *     `slot="icon"`):  `UIMessage.css` switches to the icon layout (`--_ui-message-layout: icon`) by it.
 *
 * - It OWNS the `header` and `content` parts (`ownsParts`):
 *   a slotted `<ui-header>` or `<ui-content>` finds it through `PartContext`,
 *   sets `:state(in-message)` and styles itself from `UIParts.css`, reading the owner tokens `UIMessage.css` declares
 *   on the inner box. `define()` registers it as their owner;  nothing to do here.
 *
 * - Dismissing:  the close button sends the cancelable `ui-dismiss`.
 *   Unless it's cancelled, the element sets `hidden` on ITSELF.
 *   It never removes itself:  a framework that drew the node still owns it.
 *
 * - No role:  a message inserted to announce something gets `role="status"` or `alert` from the page.
 ****************/
export class UIMessage extends E.UIComponent<typeof messageVocabulary> {
  @E.proto static vocabulary = messageVocabulary
  @E.proto static styleSheets = { message: messageCSS }

  /** Which of its slots have content in the light DOM:  a slotted icon. */
  readonly slots = new E.SlotContent(this.domElement)

  /** The glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** The glyph of the close button. */
  readonly closeGlyph = new E.IconGlyph({
    owner: this,
    name: () => (this.dismissible ? UIT.CLOSE_ICON : undefined)
  })

  /** Has an icon (shorthand or `icon` slot)? */
  get hasIcon(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName(UIT.ICON))
  }

  /** The `icon` class after the noun while it shows an icon:  the sheet's icon layout. */
  protected get extraClasses(): string | undefined {
    return this.hasIcon ? UIT.ICON_CLASS : undefined
  }

  /** For dark backgrounds?  `:state(inverted)`. */
  @E.cssState("inverted")
  get isInverted(): boolean {
    return this.inverted
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("message")}>
        <Show when={this.hasIcon}>
          <span class={UIT.ICON} part={this.partForName("icon")}>
            <slot name={this.slotForName(UIT.ICON)}>{this.iconGlyph.svg}</slot>
          </span>
        </Show>
        <div class={UIT.CONTENT} part={this.partForName("content")}>
          <Show when={this.header}>
            <div class={UIT.HEADER} part={this.partForName("header")}>
              {this.header}
            </div>
          </Show>
          <slot />
        </div>
        <Show when={this.dismissible}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.partForName("close")}
            aria-label={this.translationForKey("dismiss")}
            onClick={this.onDismiss}
          >
            {this.closeGlyph.svg}
          </button>
        </Show>
      </div>
    )
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** The close button:  announce, then hide, unless a handler cancelled. */
  private readonly onDismiss = (event: MouseEvent) => {
    const detail: UIT.MessageDismissDetail = { originalEvent: event }
    if (this.send("ui-dismiss", detail)) this.domElement.hidden = true
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIMessage extends E.AttributeValues<typeof messageVocabulary> {}
