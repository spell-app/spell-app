import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { messageVocabulary } from "./ui-message.vocabulary.en"
import { MessageFallback } from "./ui-message.fallback"

import messageCSS from "./ui-message.css?inline"

/****************
 * ### `<ui-message>`
 * A message:  `<div class="ui … message" part="message">` holding, in order, the icon box, the ALWAYS-present
 * `<div class="content" part="content">` (the `header` shorthand, then the default slot) and the `dismissible`
 * close button.
 * - `icon` class (after the noun) while there's an icon, the `icon` shorthand or a slotted `slot="icon"`:
 *   `ui-message.css` switches to the icon layout (`--_ui-message-layout: icon`) by it.
 * - OWNER of the `header` and `content` parts (`ownsParts`):  a slotted `<ui-header>` / `<ui-content>` finds it
 *   through `PartContext`, sets `:state(in-message)` and styles itself from `ui-parts.css`, reading the owner tokens
 *   `ui-message.css` declares on the root.  Registered by `define()`;  nothing to do here.
 * - Dismissing:  the close button dispatches the cancelable `ui-dismiss`;  not cancelled, the element sets
 *   `hidden` on ITSELF.  It never removes itself:  a framework that rendered the node still owns it.
 * - No role:  a message inserted to announce something gets `role="status"` / `alert` from the page.
 ****************/
export class UIMessage extends E.UIElement<typeof messageVocabulary> {
  @E.proto static vocabulary = messageVocabulary
  @E.proto static styles = { message: messageCSS }
  @E.proto static Fallback = MessageFallback

  /** Light-DOM slot occupancy:  a slotted icon. */
  readonly slots = new E.SlotContent(this.host)

  /** Glyph of the `icon` shorthand. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.attrs.icon })

  /** Glyph of the close button. */
  readonly closeGlyph = new E.IconGlyph({
    owner: this,
    name: () => (this.attrs.dismissible ? UIT.CLOSE_ICON : undefined)
  })

  /** Has an icon (shorthand or `icon` slot)? */
  readonly hasIcon = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot(UIT.ICON)))

  /** The `icon` class after the noun while it shows an icon:  the sheet's icon layout. */
  protected extraClasses(): string | undefined {
    return this.hasIcon() ? UIT.ICON_CLASS : undefined
  }

  protected hostStates() {
    return { inverted: this.attrs.inverted }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("message")}>
        <Show when={this.hasIcon()}>
          <span class={UIT.ICON} part={this.part("icon")}>
            <slot name={this.slot(UIT.ICON)}>{this.glyph.svg()}</slot>
          </span>
        </Show>
        <div class={UIT.CONTENT} part={this.part("content")}>
          <Show when={this.attrs.header}>
            <div class={UIT.HEADER} part={this.part("header")}>
              {this.attrs.header}
            </div>
          </Show>
          <slot />
        </div>
        <Show when={this.attrs.dismissible}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.part("close")}
            aria-label={this.text("dismiss")}
            onClick={this.onDismiss}
          >
            {this.closeGlyph.svg()}
          </button>
        </Show>
      </div>
    )
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** Close button:  announce, then hide unless a handler cancelled. */
  private readonly onDismiss = (event: MouseEvent) => {
    const detail: UIT.MessageDismissDetail = { originalEvent: event }
    if (this.emit("ui-dismiss", detail)) this.host.hidden = true
  }
}
