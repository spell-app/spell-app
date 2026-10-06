import { createEffect, createMemo, For, Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import {
  DOCS_PLAIN_THEME,
  type DocsLook,
  type DocsShownScheme,
  type SiteDataFile
} from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import { ThemeMenu } from "./ThemeMenu"
import { DocsThemesFallback } from "./ui-docs-themes.fallback"
import {
  DocsThemesChanges,
  type DocsThemesShow,
  type DocsThemesText,
  type DocsThemesVocabulary
} from "./ui-docs-themes.types"
import { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"

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
export class UIDocsThemes extends E.UIElement<DocsThemesVocabulary> {
  @E.proto static vocabulary = docsThemesVocabulary
  @E.proto static styles = { "docs-themes": themesCSS }
  @E.proto static Fallback = DocsThemesFallback
  @E.proto static delegatesFocus = false

  /** The page's look, as last chosen by any picker. */
  readonly look = new E.Cell<DocsLook>(isServer ? SERVER_LOOK : untrack(() => ThemePreference.look))

  /** The scheme the OS asks for:  what the page shows while following it. */
  readonly os = new E.Cell<DocsShownScheme>(isServer ? "light" : untrack(() => ThemePreference.osScheme()))

  /** The overlay is open. */
  readonly open = new E.Cell(false)

  /** The theme row holding the list's one tab stop (roving `tabindex`):  a menu value;  `undefined`:  the chosen one. */
  readonly active = new E.Cell<string | undefined>(undefined)

  /** The site data, once loaded:  titles and `for`'s families.  `undefined` before, or if it failed. */
  readonly data = new E.Cell<SiteDataFile | undefined>(undefined)

  /** `text()` as a plain function, for `ThemeMenu`. */
  readonly texts: DocsThemesText = (key, params) => this.text(key, params)

  /**
   * What the list / dropdown shows, for `for`.
   * - `lazy`:  `UI.themes` exists once the runtime has loaded, which this constructor may run before;  only `render()`
   *   reads it, and that waits for the runtime.
   */
  readonly menu = createMemo(
    () => new ThemeMenu({ names: UI.themes.names, data: this.data.get(), forTag: this.attrs.for, text: this.texts }),
    { lazy: true }
  )

  /** The scheme the page shows:  the chosen one, or the OS's while following it. */
  readonly shown = createMemo((): DocsShownScheme => {
    const { scheme } = this.look.get()
    return scheme === "system" ? this.os.get() : scheme
  })

  /** The chosen theme's menu value (`DOCS_PLAIN_THEME`:  our own look). */
  readonly chosen = createMemo(() => this.look.get().theme ?? DOCS_PLAIN_THEME)

  /** Wired to the site data and `ThemePreference` (see `wire()`). */
  readonly isWired: boolean = !isServer && this.wire()

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
        <Show when={this.show() === "theme"}>{this.dropdown()}</Show>
        <Show when={this.show() === "both"}>{this.palette()}</Show>
        <Show when={this.show() !== "theme"}>{this.schemeButton()}</Show>
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
   * Follow the OS's scheme (`system`), or keep the one showing now as a choice of its own (`shown`:  nothing changes
   * on screen), as the viewer did with `event`.
   */
  chooseScheme(choice: SchemeChoice, event?: Event): void {
    ThemePreference.setScheme(choice === "system" ? "system" : ThemePreference.shownScheme())
    this.emitChange(event)
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The sun / moon button and its tooltip. */
  private schemeButton(): JSX.Element {
    const next = () => (this.shown() === "dark" ? this.text("toLight") : this.text("toDark"))
    return (
      <>
        <button
          type="button"
          class={[SCHEME_CLASS, BUTTON_CLASS, { light: this.shown() === "light", dark: this.shown() === "dark" }]}
          part={this.part("scheme")}
          aria-label={next()}
          onClick={(event) => this.flipScheme(event)}
        >
          <For each={ShownSchemes}>
            {(scheme) => (
              <span class={[scheme, GLYPH_CLASS]} aria-hidden={UIT.TRUE}>
                <ui-icon name={SCHEME_ICONS[scheme]} fitted="" />
              </span>
            )}
          </For>
        </button>
        <ui-popup part={this.part("tip")} inverted="" size={MINI} position={TIP_POSITION}>
          {next()}
        </ui-popup>
      </>
    )
  }

  /** The palette button, its tooltip and the overlay. */
  private palette(): JSX.Element {
    const label = () => this.text("palette", { title: this.titleFor(this.look.get().theme) })
    const isFollowing = () => this.look.get().scheme === "system"
    return (
      <>
        <button
          type="button"
          id={IDS.palette}
          class={[PALETTE_CLASS, BUTTON_CLASS]}
          part={this.part("palette")}
          aria-label={label()}
        >
          <span class={GLYPH_CLASS} aria-hidden={UIT.TRUE}>
            <ui-icon name={PALETTE_ICON} fitted="" />
          </span>
        </button>
        {/* `on` stays a literal:  Solid compiles an `on={...}` EXPRESSION as an event listener, not an attribute */}
        <ui-popup
          part={this.part("overlay")}
          class={OVERLAY_CLASS}
          on="click"
          basic=""
          position="bottom right"
          aria-label={this.text("overlayName")}
          ref={(popup: HTMLElement) => this.wireOverlay(popup)}
        >
          <div class={PANEL_CLASS}>
            <div class={HEADING_CLASS} id={IDS.heading}>
              {this.text("themeName")}
            </div>
            <div
              class={MENU_CLASS}
              part={this.part("menu")}
              role={MENU_ROLES.menu}
              aria-labelledby={IDS.heading}
              onKeyDown={(event) => this.onMenuKey(event)}
            >
              <For each={this.menu().entries}>{(entry) => this.entry(entry)}</For>
            </div>
            <div class={DIVIDER_CLASS} role={UIT.SEPARATOR} />
            <button
              type="button"
              class={SYSTEM_CLASS}
              part={this.part("system")}
              role={MENU_ROLES.switch}
              aria-checked={isFollowing() ? UIT.TRUE : UIT.FALSE}
              onClick={(event) => this.chooseScheme(isFollowing() ? "shown" : "system", event)}
            >
              <span class={UIT.LABEL}>
                <span class={NAME_CLASS}>{this.text("matchSystem")}</span>
                <span class={UIT.DESCRIPTION}>{this.text("matchSystemDescription")}</span>
              </span>
              <span class={TRACK_CLASS} aria-hidden={UIT.TRUE} />
            </button>
          </div>
        </ui-popup>
        <ui-popup
          part={this.part("tip")}
          for={IDS.palette}
          inverted=""
          size={MINI}
          position={TIP_POSITION}
          hidden={this.open.get() ? "" : undefined}
        >
          {label()}
        </ui-popup>
      </>
    )
  }

  /** One row of the overlay's list:  a theme, a divider or a header. */
  private entry(entry: E.MenuEntry): JSX.Element {
    if ("type" in entry) {
      return entry.type === "divider" ? (
        <div class={DIVIDER_CLASS} role={UIT.SEPARATOR} />
      ) : (
        <div class={UIT.HEADER}>{entry.text}</div>
      )
    }
    const isChecked = () => this.chosen() === entry.value
    return (
      <button
        type="button"
        class={[OPTION_CLASS, { checked: isChecked() }]}
        part={this.part("option")}
        role={MENU_ROLES.item}
        value={entry.value}
        aria-checked={isChecked() ? UIT.TRUE : UIT.FALSE}
        tabindex={(this.active.get() ?? this.chosen()) === entry.value ? 0 : -1}
        onClick={(event) => this.pickOption(entry.value, event)}
      >
        <span class={CHECK_CLASS} aria-hidden={UIT.TRUE}>
          <ui-icon name={CHECK_ICON} fitted="" />
        </span>
        <span class={NAME_CLASS}>{entry.text}</span>
        <Show when={entry.description}>
          <span class={UIT.DESCRIPTION}>{entry.description}</span>
        </Show>
      </button>
    )
  }

  /** The theme `<ui-dropdown>` (`show="theme"`). */
  private dropdown(): JSX.Element {
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
        <span slot="trigger">{this.menu().labelFor(this.look.get().theme)}</span>
        <For each={this.menu().entries}>
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
  private titleFor(theme: string | undefined): string {
    return theme === undefined ? this.text("default") : this.menu().titleFor(theme)
  }

  /** The dropdown's `ui-change`:  stop it (the host fires its own), and choose its value. */
  private pickTheme(event: Event): void {
    event.stopPropagation()
    const { value } = (event as CustomEvent<{ value: string }>).detail
    void this.setTheme(value === DOCS_PLAIN_THEME ? undefined : value, event)
  }

  /**
   * A theme row's click (or Enter / Space):  choose it, keep the tab stop on it;  the overlay stays open.
   * - Compared with `ThemePreference.look`, never `chosen()`:  a click right after another reads that one's value
   *   before the write lands.
   */
  private pickOption(value: string, event: Event): void {
    this.active.set(value)
    const theme = value === DOCS_PLAIN_THEME ? undefined : value
    if (theme !== ThemePreference.look.theme) void this.setTheme(theme, event)
  }

  /** Arrow keys, Home and End in the theme list:  move focus (and the tab stop) between rows. */
  private onMenuKey(event: KeyboardEvent): void {
    const step = MENU_KEYS[event.key]
    if (step === undefined) return
    const rows = this.rows()
    if (!rows.length) return
    event.preventDefault()
    const at = rows.indexOf((event.target as Element).closest<HTMLButtonElement>(ITEM_SELECTOR)!)
    const index =
      step === "first" ? 0 : step === "last" ? rows.length - 1 : (Math.max(at, 0) + step + rows.length) % rows.length
    this.focusRow(rows[index]!)
  }

  /** The list's theme rows, in order. */
  private rows(): HTMLButtonElement[] {
    return [...(this.host.shadowRoot?.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR) ?? [])]
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
    const look = ThemePreference.look
    this.emit("ui-change", DocsThemesChanges.detailFor({ look, shown: ThemePreference.shownScheme(), originalEvent }))
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
      (isConnected) => {
        if (!isConnected) return
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

/**
 * What `chooseScheme()` does:
 * - `system`:  follow the OS's scheme
 * - `shown`:  keep the scheme the page shows now, as a choice of its own
 */
export type SchemeChoice = "system" | "shown"

/** The schemes a page shows, in the button's glyph order:  each glyph is a class word and a `SCHEME_ICONS` key. */
const ShownSchemes = ["light", "dark"] as const satisfies readonly DocsShownScheme[]

/**
 * Icon the scheme button shows for the scheme the page SHOWS (`fomantic` pack).
 * - the OUTLINE sun:  the solid one reads as a cog at 14px
 */
const SCHEME_ICONS: Readonly<Record<DocsShownScheme, string>> = { light: "sun outline", dark: "moon" }

/** Icon of the button opening the overlay (`fomantic` pack). */
const PALETTE_ICON = "palette"

/** Icon marking the chosen theme in the overlay's list (`fomantic` pack). */
const CHECK_ICON = "check"

/** The look a server render shows:  no storage there. */
const SERVER_LOOK: DocsLook = { theme: undefined, scheme: "system" }

/** Shadow-root ids:  the palette button (its tooltip's `for`) and the overlay's header (its list's name). */
const IDS = { palette: "palette", heading: "themes-heading" } as const

/** ARIA of the overlay's theme list:  a menu of radio items (arrows move, Enter / Space / click picks), and its switch. */
const MENU_ROLES = { menu: "menu", item: "menuitemradio", switch: "switch" } as const

/** A theme row of the overlay's list. */
const ITEM_SELECTOR = `[role="${MENU_ROLES.item}"]`

/** Keys that move focus in the overlay's theme list, by how far:  `"first"` / `"last"` jump to an end. */
const MENU_KEYS: Readonly<Record<string, number | "first" | "last">> = {
  [UIT.Key.arrowDown]: 1,
  [UIT.Key.arrowUp]: -1,
  [UIT.Key.home]: "first",
  [UIT.Key.end]: "last"
}

/** Where the buttons' tooltips show. */
const TIP_POSITION = "bottom center"

/** `size` of the tooltips. */
const MINI = "mini"

/** Class word of both round buttons. */
const BUTTON_CLASS = "button"

/** Class word of the light / dark button. */
const SCHEME_CLASS = "scheme"

/** Class word of the palette button. */
const PALETTE_CLASS = "palette"

/** Class word of a button's icon box. */
const GLYPH_CLASS = "glyph"

/** Class word of the overlay's `<ui-popup>`. */
const OVERLAY_CLASS = "overlay"

/** Class word of the overlay's content. */
const PANEL_CLASS = "panel"

/** Class word of the overlay's header. */
const HEADING_CLASS = "heading"

/** Class word of the overlay's theme list. */
const MENU_CLASS = "menu"

/** Class word of a divider in the overlay. */
const DIVIDER_CLASS = "divider"

/** Class word of the "Match system" switch. */
const SYSTEM_CLASS = "system"

/** Class word of the switch's track (and knob). */
const TRACK_CLASS = "track"

/** Class word of a row's or the switch's name. */
const NAME_CLASS = "name"

/** Class word of a theme row. */
const OPTION_CLASS = "option"

/** Class word of a theme row's check mark. */
const CHECK_CLASS = "check"
