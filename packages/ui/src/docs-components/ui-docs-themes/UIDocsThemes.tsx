import { createEffect, createMemo, For, Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UI, UIElement, type MenuEntry } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import type { DocsLook, DocsShownScheme, SiteDataFile } from "$/ui/docs-components/docs-components.types"

import { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"
import { DocsThemesFallback } from "./ui-docs-themes.fallback"
import { ThemeMenu } from "./ThemeMenu"
import {
  CHECK_ICON,
  DEFAULT_VALUE,
  IDS,
  MENU_KEYS,
  MENU_ROLES,
  PALETTE_ICON,
  SCHEME_ICONS,
  SERVER_LOOK,
  type DocsThemesChange,
  type DocsThemesShow,
  type DocsThemesText,
  type DocsThemesVocabulary
} from "./ui-docs-themes.types"

import themesCSS from "./ui-docs-themes.css?inline"

/****************
 * ### `<ui-docs-themes>`
 * The docs site's look controls, `<div class="ui [size] [inverted] themes" part="controls">` holding, by `show`:
 * - `both` (default):  two round icon buttons, compact enough for a side column or a phone's top bar:
 *   - `<button part="palette">`:  opens `<ui-popup part="overlay" on="click">`, a small panel with the theme list
 *     (`role=menu` of `menuitemradio`s:  Spell, Plain, Classic, then Fomantic's;  the chosen one checked) and a
 *     "Match system" switch (`role=switch`:  on while the scheme follows the OS)
 *   - `<button part="scheme">`:  a sun on a light page, a moon on a dark one -- the scheme the page SHOWS, the OS's
 *     while following it;  a click flips it and stores it (no longer following the OS).  The icons cross-fade:  the
 *     new one grows from a quarter, un-blurring, the old one the reverse
 *   - each with a tooltip, `<ui-popup part="tip" inverted size="mini">` (the palette's hides while its overlay is open)
 * - `scheme`:  the sun / moon button alone
 * - `theme`:  a theme `<ui-dropdown part="theme" floating scrolling button>` -- a component page's masthead, with
 *   `for="ui-x"`:  only the themes touching that family, and the dropdown says `N themes` (Fomantic's per-page
 *   dropdown).  Its rows are `<ui-item>` children;  its text is replaced through its `trigger` slot.
 * - The look itself is `ThemePreference`'s (one per page, remembered per viewer, the scheme shared with every doc
 *   site's header):  picking calls `ThemePreference.setTheme()` / `setScheme()` / `flipScheme()`, then fires ONE
 *   `ui-change` (the dropdown's own is stopped).  Every picker on the page follows any picker's change, and the OS's
 *   while following it (`subscribe()`, while connected).
 * - Keyboard, overlay:  focus moves to the chosen theme as it opens;  arrows / Home / End move through the list (one
 *   tab stop, roving `tabindex`), Enter / Space / click pick (the overlay stays open to compare), Tab reaches the
 *   switch, Escape closes it and focus goes back to the palette button (`UI.overlays`).
 * - A doc-only element (`src/docs-components/`):  its shadow composes `<ui-popup>`, `<ui-icon>`, `<ui-dropdown>` and
 *   `<ui-item>`, which its barrel imports.
 ****************/
export class UIDocsThemes extends UIElement<DocsThemesVocabulary> {
  @proto static vocabulary = docsThemesVocabulary
  @proto static styles = { "docs-themes": themesCSS }
  @proto static Fallback = DocsThemesFallback
  @proto static delegatesFocus = false

  /** The page's look, as last chosen by any picker. */
  readonly look = new Cell<DocsLook>(isServer ? SERVER_LOOK : untrack(() => ThemePreference.look))

  /** The scheme the OS asks for:  what the page shows while following it. */
  readonly os = new Cell<DocsShownScheme>(isServer ? "light" : untrack(() => ThemePreference.osScheme()))

  /** The overlay is open. */
  readonly open = new Cell(false)

  /** The theme row holding the list's one tab stop (roving `tabindex`):  a menu value;  `undefined`:  the chosen one. */
  readonly active = new Cell<string | undefined>(undefined)

  /** The site data, once loaded:  titles and `for`'s families.  `undefined` before, or if it failed. */
  readonly data = new Cell<SiteDataFile | undefined>(undefined)

  /**
   * What the list / dropdown shows, for `for`.
   * - `lazy`:  `UI.themes` exists once the runtime has loaded, which this constructor may run before;  only `render()`
   *   reads it, and that waits for the runtime.
   */
  readonly menu = createMemo(() => new ThemeMenu(UI.themes.names, this.data.get(), this.attrs.for), { lazy: true })

  /** The scheme the page shows:  the chosen one, or the OS's while following it. */
  readonly shown = createMemo((): DocsShownScheme => {
    const { scheme } = this.look.get()
    return scheme === "system" ? this.os.get() : scheme
  })

  /** The chosen theme's menu value (`DEFAULT_VALUE`:  our own look). */
  readonly chosen = createMemo(() => this.look.get().theme ?? DEFAULT_VALUE)

  /** `text()` as a plain function, for `ThemeMenu`. */
  readonly texts: DocsThemesText = (key, params) => this.text(key, params)

  /** Wired to the site data and `ThemePreference` (see `wire()`). */
  readonly wired: boolean = !isServer && this.wire()

  protected override hostStates() {
    const look = this.look.get()
    return {
      themed: look.theme !== undefined,
      dark: this.shown() === "dark",
      following: look.scheme === "system",
      open: this.open.get()
    }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("controls")}>
        <Show when={this.show() === "theme"}>{this.renderDropdown()}</Show>
        <Show when={this.show() === "both"}>{this.renderPalette()}</Show>
        <Show when={this.show() !== "theme"}>{this.renderScheme()}</Show>
      </div>
    )
  }

  /** Choose theme `name` (`undefined`:  our own look), as the viewer did with `event`. */
  async setTheme(name: string | undefined, event?: Event): Promise<void> {
    const applied = ThemePreference.setTheme(name)
    this.emitChange(event)
    await applied
  }

  /** Flip the scheme the page shows, light <-> dark, as the viewer did with `event`. */
  flipScheme(event?: Event): void {
    ThemePreference.flipScheme()
    this.emitChange(event)
  }

  /**
   * Follow the OS's scheme (`on`), or keep the one showing now as a choice of its own (off:  nothing changes on
   * screen), as the viewer did with `event`.
   */
  matchSystem(on: boolean, event?: Event): void {
    ThemePreference.setScheme(on ? "system" : ThemePreference.shownScheme())
    this.emitChange(event)
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The sun / moon button and its tooltip. */
  private renderScheme(): JSX.Element {
    const next = () => (this.shown() === "dark" ? this.text("toLight") : this.text("toDark"))
    return (
      <>
        <button
          type="button"
          class={["scheme", "button", { light: this.shown() === "light", dark: this.shown() === "dark" }]}
          part={this.part("scheme")}
          aria-label={next()}
          onClick={(event) => this.flipScheme(event)}
        >
          <For each={["light", "dark"] as const}>
            {(scheme) => (
              <span class={[scheme, "glyph"]} aria-hidden="true">
                <ui-icon name={SCHEME_ICONS[scheme]} fitted="" />
              </span>
            )}
          </For>
        </button>
        <ui-popup part={this.part("tip")} inverted="" size="mini" position="bottom center">
          {next()}
        </ui-popup>
      </>
    )
  }

  /** The palette button, its tooltip and the overlay. */
  private renderPalette(): JSX.Element {
    const label = () => this.text("palette", { title: this.title(this.look.get().theme) })
    return (
      <>
        <button type="button" id={IDS.palette} class="palette button" part={this.part("palette")} aria-label={label()}>
          <span class="glyph" aria-hidden="true">
            <ui-icon name={PALETTE_ICON} fitted="" />
          </span>
        </button>
        <ui-popup
          part={this.part("overlay")}
          class="overlay"
          on="click"
          basic=""
          position="bottom right"
          aria-label={this.text("overlayName")}
          ref={(popup: HTMLElement) => this.wireOverlay(popup)}
        >
          <div class="panel">
            <div class="heading" id={IDS.heading}>
              {this.text("themeName")}
            </div>
            <div
              class="menu"
              part={this.part("menu")}
              role={MENU_ROLES.menu}
              aria-labelledby={IDS.heading}
              onKeyDown={(event) => this.onMenuKey(event)}
            >
              <For each={this.menu().entries(this.texts)}>{(entry) => this.renderEntry(entry)}</For>
            </div>
            <div class="divider" role={MENU_ROLES.separator} />
            <button
              type="button"
              class="system"
              part={this.part("system")}
              role={MENU_ROLES.switch}
              aria-checked={this.look.get().scheme === "system" ? "true" : "false"}
              onClick={(event) => this.matchSystem(this.look.get().scheme !== "system", event)}
            >
              <span class="label">
                <span class="name">{this.text("matchSystem")}</span>
                <span class="description">{this.text("matchSystemDescription")}</span>
              </span>
              <span class="track" aria-hidden="true" />
            </button>
          </div>
        </ui-popup>
        <ui-popup
          part={this.part("tip")}
          for={IDS.palette}
          inverted=""
          size="mini"
          position="bottom center"
          hidden={this.open.get() ? "" : undefined}
        >
          {label()}
        </ui-popup>
      </>
    )
  }

  /** One row of the overlay's list:  a theme, a divider or a header. */
  private renderEntry(entry: MenuEntry): JSX.Element {
    if ("type" in entry) {
      return entry.type === "divider" ? (
        <div class="divider" role={MENU_ROLES.separator} />
      ) : (
        <div class="header">{entry.text}</div>
      )
    }
    const checked = () => this.chosen() === entry.value
    return (
      <button
        type="button"
        class={["option", { checked: checked() }]}
        part={this.part("option")}
        role={MENU_ROLES.item}
        value={entry.value}
        aria-checked={checked() ? "true" : "false"}
        tabindex={(this.active.get() ?? this.chosen()) === entry.value ? 0 : -1}
        onClick={(event) => this.pickOption(entry.value, event)}
      >
        <span class="check" aria-hidden="true">
          <ui-icon name={CHECK_ICON} fitted="" />
        </span>
        <span class="name">{entry.text}</span>
        <Show when={entry.description}>
          <span class="description">{entry.description}</span>
        </Show>
      </button>
    )
  }

  /** The theme `<ui-dropdown>` (`show="theme"`). */
  private renderDropdown(): JSX.Element {
    return (
      <ui-dropdown
        part={this.part("theme")}
        floating=""
        scrolling=""
        button=""
        basic={this.attrs.inverted ? undefined : ""}
        inverted={this.attrs.inverted ? "" : undefined}
        size={this.attrs.size}
        text={this.text("themeName")}
        value={this.chosen()}
        ref={(dropdown: HTMLElement) => dropdown.addEventListener("ui-change", (event) => this.pickTheme(event))}
      >
        <span slot="trigger">{this.menu().label(this.look.get().theme, this.texts)}</span>
        <For each={this.menu().entries(this.texts)}>
          {(entry) =>
            "type" in entry ? (
              <ui-item type={entry.type}>{entry.text}</ui-item>
            ) : (
              <ui-item value={entry.value} description={entry.description}>
                {entry.text}
              </ui-item>
            )
          }
        </For>
      </ui-dropdown>
    )
  }

  ////////////////
  // ## Internals
  ////////////////

  /** `show`, defaulted. */
  private show(): DocsThemesShow {
    return (this.attrs.show as DocsThemesShow | undefined) ?? "both"
  }

  /** Display title of theme `theme` (`undefined`:  our own look, `Plain`). */
  private title(theme: string | undefined): string {
    return theme === undefined ? this.text("default") : this.menu().title(theme)
  }

  /** The dropdown's `ui-change`:  stop it (the host fires its own), and choose its value. */
  private pickTheme(event: Event): void {
    event.stopPropagation()
    const { value } = (event as CustomEvent<{ value: string }>).detail
    void this.setTheme(value === DEFAULT_VALUE ? undefined : value, event)
  }

  /**
   * A theme row's click (or Enter / Space):  choose it, keep the tab stop on it;  the overlay stays open.
   * - Compared with `ThemePreference.look`, never `chosen()`:  a click right after another reads that one's value
   *   before the write lands.
   */
  private pickOption(value: string, event: Event): void {
    this.active.set(value)
    const theme = value === DEFAULT_VALUE ? undefined : value
    if (theme !== ThemePreference.look.theme) void this.setTheme(theme, event)
  }

  /** Arrow keys, Home and End in the theme list:  move focus (and the tab stop) between rows. */
  private onMenuKey(event: KeyboardEvent): void {
    const step = MENU_KEYS[event.key]
    if (step === undefined) return
    const rows = this.rows()
    if (!rows.length) return
    event.preventDefault()
    const at = rows.indexOf((event.target as Element).closest<HTMLButtonElement>(`[role="${MENU_ROLES.item}"]`)!)
    const index =
      step === "first" ? 0 : step === "last" ? rows.length - 1 : (Math.max(at, 0) + step + rows.length) % rows.length
    this.focusRow(rows[index]!)
  }

  /** The list's theme rows, in order. */
  private rows(): HTMLButtonElement[] {
    return [...(this.host.shadowRoot?.querySelectorAll<HTMLButtonElement>(`[role="${MENU_ROLES.item}"]`) ?? [])]
  }

  /** Focus theme row `row`, and give it the tab stop. */
  private focusRow(row: HTMLButtonElement): void {
    this.active.set(row.value)
    row.focus()
  }

  /**
   * Follow the overlay:  `open` (a host state;  hides the palette's tooltip) from its `ui-open` / `ui-close`, and
   * focus the chosen theme once it shows (`toggle`), its tab stop reset to it.
   */
  private wireOverlay(popup: HTMLElement): void {
    popup.addEventListener("ui-open", (event) => {
      if (!event.defaultPrevented) this.open.set(true)
    })
    popup.addEventListener("ui-close", (event) => {
      if (!event.defaultPrevented) this.open.set(false)
    })
    popup.addEventListener("toggle", (event) => {
      if ((event as ToggleEvent).newState !== "open") return
      this.active.set(undefined)
      const row = this.rows().find((each) => each.value === untrack(this.chosen)) ?? this.rows()[0]
      row?.focus()
    })
  }

  /** Fire `ui-change` with the look now. */
  private emitChange(originalEvent?: Event): void {
    const { theme, scheme } = ThemePreference.look
    const detail: DocsThemesChange = {
      ...(theme !== undefined && { theme }),
      scheme,
      shown: ThemePreference.shownScheme(),
      originalEvent
    }
    this.emit("ui-change", detail)
  }

  /**
   * Load the site data (a promise callback writes it), and follow `ThemePreference` while connected:  catch up
   * on connect (another picker, or the OS, may have changed the look meanwhile), unsubscribe on disconnect.
   */
  private wire(): true {
    SiteData.load().then(
      (data) => this.data.set(data),
      () => undefined // no data:  the menu stays unfiltered, titled from sheet names
    )
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (!connected) return
        this.follow(ThemePreference.look)
        return ThemePreference.subscribe((look) => this.follow(look))
      }
    )
    return true
  }

  /** Take `look`, and the OS's scheme now. */
  private follow(look: DocsLook): void {
    this.look.set(look)
    this.os.set(ThemePreference.osScheme())
  }
}
