import { E, UIT } from "$/ui/core"
import { dimmerVocabulary } from "./ui-dimmer.vocabulary.en"

/****************
 * ### `DimmerFallback`
 * The element's markup without Solid:  `<div class="ui ... dimmer" part="dimmer"><div class="content"><slot>`, or
 * for `page` a native `<dialog>` shown with `showModal()` -- so a page dimmer still covers, blocks and traps.
 * - Follows the host's `active` attribute (a `MutationObserver`), with the `active` class;  a page dimmer closed
 *   by the browser (Escape) drops `active` and fires `ui-hide`.
 ****************/
export class DimmerFallback extends E.NativeFallback<typeof dimmerVocabulary> {
  @E.proto static vocabulary = dimmerVocabulary
  @E.proto static degraded = [
    "`show-on` (hover / click), clicks on the dimmer, `closedby`, invoker commands, `ui-open` / `ui-close` / `ui-show`",
    "a page dimmer:  the browser's own Escape handling, no scroll lock or overlay stack, no fade;  " +
      "the translated `dimmedPage` name (English only)",
    "an element dimmer's parent isn't positioned for it (the page sheet is the element's)"
  ]

  /** The dimmer box. */
  private box?: HTMLElement

  /** Watches the host's `active`. */
  private observer?: MutationObserver

  protected override build() {
    const isPage = this.flag("page")
    const content = this.create("div", { class: UIT.CONTENT, part: UIT.CONTENT }, this.slot())
    const box = isPage
      ? this.create("dialog", {
          class: this.classes(),
          [UIT.ARIA_LABEL]: this.host.getAttribute(UIT.ARIA_LABEL) ?? this.label()
        })
      : this.create("div", { class: this.classes() })
    box.append(content)
    if (box instanceof HTMLDialogElement) this.listen(box, "close", () => this.onClosed())
    this.box = this.decorate(box, "dimmer")
    return [this.box]
  }

  protected override attached() {
    this.sync()
    this.observer = new MutationObserver(() => this.sync())
    this.observer.observe(this.host, { attributeFilter: [UIT.ACTIVE] })
  }

  override dispose() {
    this.observer?.disconnect()
    if (this.box instanceof HTMLDialogElement && this.box.open) this.box.close()
    super.dispose()
  }

  /** Show / hide as the host's `active` says. */
  private sync() {
    const box = this.box
    if (!box?.isConnected) return
    const isActive = E.Converters.boolean(this.host.getAttribute(UIT.ACTIVE), UIT.ACTIVE) && !this.flag("disabled")
    box.classList.toggle(UIT.ACTIVE, isActive)
    if (!(box instanceof HTMLDialogElement)) return
    if (isActive && !box.open) box.showModal()
    else if (!isActive && box.open) box.close()
  }

  /** A page dimmer closed (Escape):  drop `active`, tell the page. */
  private onClosed() {
    this.box?.classList.remove(UIT.ACTIVE)
    if (this.host.hasAttribute(UIT.ACTIVE)) this.host.removeAttribute(UIT.ACTIVE)
    const detail: UIT.DimmerOpenDetail = { active: false }
    this.host.dispatchEvent(new CustomEvent(HIDE, { bubbles: true, composed: true, detail }))
  }

  /** English name of an unnamed page dimmer. */
  private label(): string {
    return this.vocabulary.texts.find(({ key }) => key === "dimmedPage")!.text
  }
}

/** The event a page dimmer the browser closed fires, checked against the vocabulary. */
const HIDE: E.EventName<typeof dimmerVocabulary> = "ui-hide"
