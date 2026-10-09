import { For, Show, untrack } from "solid-js"
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
import {
  type DocsThemesChange,
  type DocsThemesShow,
  type DocsThemesText,
  type DocsThemesVocabulary
} from "./UIDocsThemes.types"
import { docsThemesVocabulary } from "./UIDocsThemes.en"

import themesCSS from "./UIDocsThemes.css?inline"

/****************
 * ### `UIDocsThemes`
 * The component behind `<ui-docs-themes>`:  the docs site's look controls.
 *
 * - Its shadow DOM:  `<div class="ui [size] [inverted] themes" part="controls">`, holding by `show`:
 *   - `both` (the default):  two round icon buttons, compact enough for a side column or a phone's top bar
 *     - `<button part="palette">` opens `<ui-popup part="overlay" open-on="click">`,
 *       a small panel with the theme list (`role=menu` of `menuitemradio`s:  Spell, Plain, Classic, then Fomantic's;
 *       the chosen one checked) and a "Match system" switch (`role=switch`:  on while the scheme follows the OS)
 *     - `<button part="scheme">`:  a sun on a light page, a moon on a dark one
 *       (the scheme the page SHOWS:  the OS's, while following it).
 *       A click flips it and stores it (no longer following the OS).
 *       The icons cross-fade:  the new one grows from a quarter, un-blurring;  the old one the reverse.
 *     - each with a tooltip,
 *       `<ui-popup part="tip" inverted size="mini">` (the palette's hides while its overlay is open)
 *   - `scheme`:  the sun / moon button alone
 *   - `theme`:  a theme `<ui-dropdown part="theme" floating scrolling button>`, for a component page's masthead.
 *     With `for="ui-x"`, it lists only the themes touching that family,
 *     and says `N themes` (Fomantic's per-page dropdown).  Its rows are `<ui-item>` children;  its text goes in its
 *     `trigger` slot.
 * - The look itself is `ThemePreference`'s (one per page, remembered per viewer,
 *   the scheme shared with every doc site's header).
 *   Picking calls `ThemePreference.setTheme()` / `setScheme()` / `flipScheme()`,
 *   then fires ONE `ui-change` (the dropdown's own is stopped).
 *   Every picker on the page follows any picker's change, and the OS's while following it
 *   (`subscribe()`, while connected).
 * - Keyboard, in the overlay:  focus moves to the chosen theme as it opens.
 *   - Arrows / Home / End move through the list (one tab stop, a roving `tabindex`)
 *   - Enter / Space / a click pick (the overlay stays open, to compare)
 *   - Tab reaches the switch;  Escape closes the overlay, and focus goes back to the palette button (`UI.overlays`).
 * - A doc-only element (`src/docs-components/`):  its shadow DOM is built of `<ui-popup>`, `<ui-icon>`,
 *   `<ui-dropdown>` and `<ui-item>`, which its barrel imports.
 ****************/
export class UIDocsThemes extends E.UIComponent<DocsThemesVocabulary> {
  @E.proto static vocabulary = docsThemesVocabulary
  @E.proto static styleSheets = { "docs-themes": themesCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    if (isServer) return
    // a promise callback writes it
    SiteData.load().then(
      (data) => (this.siteData = data),
      () => undefined // no data:  the menu stays unfiltered, titled from sheet names
    )
  }

  ////////////////
  // ## The look
  ////////////////

  /**
   * The page's look, as last chosen by any picker.
   * - A copy of `ThemePreference.look`, kept in step by `follow()`:  that one isn't reactive.
   */
  @E.state accessor look: DocsLook = isServer ? SERVER_LOOK : untrack(() => ThemePreference.look)

  /** The scheme the OS asks for:  what the page shows while following it.  A copy, as `look`. */
  @E.state accessor osScheme: DocsShownScheme = isServer ? "light" : untrack(() => ThemePreference.osScheme())

  /** The scheme the page shows:  the chosen one, or the OS's while following it. */
  get shownScheme(): DocsShownScheme {
    const { scheme } = this.look
    return scheme === "system" ? this.osScheme : scheme
  }

  /** The chosen theme's menu value (`DOCS_PLAIN_THEME`:  our own look). */
  get chosenTheme(): string {
    return this.look.theme ?? DOCS_PLAIN_THEME
  }

  /** A theme other than our own look is applied:  `:state(themed)`. */
  @E.cssState("themed")
  get isThemed(): boolean {
    return this.look.theme !== undefined
  }

  /** The page shows the dark scheme:  `:state(dark)`. */
  @E.cssState("dark")
  get isDark(): boolean {
    return this.shownScheme === "dark"
  }

  /** The scheme follows the OS:  `:state(following)`. */
  @E.cssState("following")
  get followsSystem(): boolean {
    return this.look.scheme === "system"
  }

  /**
   * Follow `ThemePreference` while connected:  catch up on connect (another picker, or the OS, may have changed the
   * look meanwhile), unsubscribe on disconnect.
   */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (!isConnected) return undefined
    this.follow(ThemePreference.look)
    return ThemePreference.subscribe((look) => this.follow(look))
  }

  /** Take `look`, and the OS's scheme now. */
  private follow(look: DocsLook): void {
    this.look = look
    this.osScheme = ThemePreference.osScheme()
  }

  ////////////////
  // ## Choosing
  ////////////////

  /** Choose theme `name` (`undefined`:  our own look), as the viewer did with `event`. */
  async chooseTheme(name: string | undefined, event?: Event): Promise<void> {
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
   * Follow the OS's scheme (`system`), or keep the one showing now as a choice of its own (`shown`:
   * nothing changes on screen), as the viewer did with `event`.
   */
  chooseScheme(choice: SchemeChoice, event?: Event): void {
    ThemePreference.setScheme(choice === "system" ? "system" : ThemePreference.shownScheme())
    this.emitChange(event)
  }

  /** Fire `ui-change` with the look now:  no `theme` key for our own look. */
  private emitChange(originalEvent?: Event): void {
    const look = ThemePreference.look
    const detail: DocsThemesChange = {
      ...(look.theme !== undefined && { theme: look.theme }),
      scheme: look.scheme,
      shown: ThemePreference.shownScheme(),
      originalEvent
    }
    this.send("ui-change", detail)
  }

  ////////////////
  // ## The theme menu
  ////////////////

  /** The site data, once loaded:  titles and `for`'s families.  `undefined` before, or if it failed. */
  @E.state accessor siteData: SiteDataFile | undefined = undefined

  /** `translationForKey()` as a plain function, for `ThemeMenu`. */
  readonly texts: DocsThemesText = (key, params) => this.translationForKey(key, params)

  /**
   * What the list / dropdown shows, for `for`.
   * - Read only once the runtime has loaded (`render()` waits for it):  `UI.themes` exists only then.
   */
  @E.derived
  get themeMenu(): ThemeMenu {
    return new ThemeMenu({ names: UI.themes.names, data: this.siteData, forTag: this.for, text: this.texts })
  }

  /** Display title of theme `theme` (`undefined`:  our own look, `Plain`). */
  private titleFor(theme: string | undefined): string {
    return theme === undefined ? this.translationForKey("default") : this.themeMenu.titleFor(theme)
  }

  /**
   * Which controls show:  `show`, else `both`.
   * - Not `this.show` alone:  an empty or unknown `show` converts to `undefined`, which shows `both`.
   */
  private get shownControls(): DocsThemesShow {
    return (this.show as DocsThemesShow | undefined) ?? "both"
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("controls")}>
        <Show when={this.shownControls === "theme"}>{this.dropdown()}</Show>
        <Show when={this.shownControls === "both"}>{this.palette()}</Show>
        <Show when={this.shownControls !== "theme"}>{this.schemeButton()}</Show>
      </div>
    )
  }

  /** The sun / moon button and its tooltip. */
  private schemeButton(): JSX.Element {
    const next = () =>
      this.shownScheme === "dark" ? this.translationForKey("toLight") : this.translationForKey("toDark")
    return (
      <>
        <button
          type="button"
          class={[
            SCHEME_CLASS,
            BUTTON_CLASS,
            { light: this.shownScheme === "light", dark: this.shownScheme === "dark" }
          ]}
          part={this.partForName("scheme")}
          aria-label={next()}
          onClick={(event) => this.flipScheme(event)}
        >
          <For each={ShownSchemes}>
            {(scheme) => (
              <span class={[scheme, GLYPH_CLASS]} aria-hidden="true">
                <ui-icon name={SCHEME_ICONS[scheme]} fitted="" />
              </span>
            )}
          </For>
        </button>
        <ui-popup part={this.partForName("tip")} inverted="" size={MINI} position={TIP_POSITION}>
          {next()}
        </ui-popup>
      </>
    )
  }

  /** The palette button, its tooltip and the overlay. */
  private palette(): JSX.Element {
    const label = () => this.translationForKey("palette", { title: this.titleFor(this.look.theme) })
    return (
      <>
        <button
          type="button"
          id={IDS.palette}
          class={[PALETTE_CLASS, BUTTON_CLASS]}
          part={this.partForName("palette")}
          aria-label={label()}
        >
          <span class={GLYPH_CLASS} aria-hidden="true">
            <ui-icon name={PALETTE_ICON} fitted="" />
          </span>
        </button>
        <ui-popup
          part={this.partForName("overlay")}
          class={OVERLAY_CLASS}
          open-on="click"
          basic=""
          position="bottom right"
          aria-label={this.translationForKey("overlayName")}
          ref={(popup: HTMLElement) => this.wireOverlay(popup)}
        >
          <div class={PANEL_CLASS}>
            <div class={HEADING_CLASS} id={IDS.heading}>
              {this.translationForKey("themeName")}
            </div>
            <div
              class={MENU_CLASS}
              part={this.partForName("menu")}
              role={MENU_ROLES.menu}
              aria-labelledby={IDS.heading}
              onKeyDown={(event) => this.onMenuKey(event)}
            >
              <For each={this.themeMenu.entries}>{(entry) => this.entry(entry)}</For>
            </div>
            <div class={DIVIDER_CLASS} role="separator" />
            <button
              type="button"
              class={SYSTEM_CLASS}
              part={this.partForName("system")}
              role={MENU_ROLES.switch}
              aria-checked={this.followsSystem ? "true" : "false"}
              onClick={(event) => this.chooseScheme(this.followsSystem ? "shown" : "system", event)}
            >
              <span class={UIT.LABEL}>
                <span class={NAME_CLASS}>{this.translationForKey("matchSystem")}</span>
                <span class={UIT.DESCRIPTION}>{this.translationForKey("matchSystemDescription")}</span>
              </span>
              <span class={TRACK_CLASS} aria-hidden="true" />
            </button>
          </div>
        </ui-popup>
        <ui-popup
          part={this.partForName("tip")}
          for={IDS.palette}
          inverted=""
          size={MINI}
          position={TIP_POSITION}
          hidden={this.isOpen ? "" : undefined}
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
        <div class={DIVIDER_CLASS} role="separator" />
      ) : (
        <div class={UIT.HEADER}>{entry.text}</div>
      )
    }
    const isChecked = () => this.chosenTheme === entry.value
    return (
      <button
        type="button"
        class={[OPTION_CLASS, { checked: isChecked() }]}
        part={this.partForName("option")}
        role={MENU_ROLES.item}
        value={entry.value}
        aria-checked={isChecked() ? "true" : "false"}
        tabindex={(this.tabStopTheme ?? this.chosenTheme) === entry.value ? 0 : -1}
        onClick={(event) => this.onOptionClick(entry.value, event)}
      >
        <span class={CHECK_CLASS} aria-hidden="true">
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
        part={this.partForName("theme")}
        floating=""
        scrolling=""
        button=""
        basic={this.inverted ? undefined : ""}
        inverted={this.inverted ? "" : undefined}
        size={this.size}
        text={this.translationForKey("themeName")}
        value={this.chosenTheme}
        ref={(dropdown: HTMLElement) => dropdown.addEventListener("ui-change", (event) => this.onDropdownChange(event))}
      >
        <span slot="trigger">{this.themeMenu.labelFor(this.look.theme)}</span>
        <For each={this.themeMenu.entries}>
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

  /** The dropdown's `ui-change`:  stop it (the DOM element fires its own), and choose its value. */
  private onDropdownChange(event: Event): void {
    event.stopPropagation()
    const { value } = (event as CustomEvent<{ value: string }>).detail
    void this.chooseTheme(value === DOCS_PLAIN_THEME ? undefined : value, event)
  }

  ////////////////
  // ## The overlay
  ////////////////

  /** The overlay is open:  `:state(open)`;  hides the palette's tooltip. */
  @E.cssState("open")
  @E.state
  accessor isOpen = false

  /**
   * The theme row holding the list's one tab stop (roving `tabindex`):  a menu value;  `undefined`:  the chosen one.
   */
  @E.state accessor tabStopTheme: string | undefined = undefined

  /**
   * A theme row's click (or Enter / Space):  choose it, keep the tab stop on it;  the overlay stays open.
   * - Compared with `ThemePreference.look`, never `chosenTheme`:  a click right after another reads that one's value
   *   before the write lands.
   */
  private onOptionClick(value: string, event: Event): void {
    this.tabStopTheme = value
    const theme = value === DOCS_PLAIN_THEME ? undefined : value
    if (theme !== ThemePreference.look.theme) void this.chooseTheme(theme, event)
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
    return [...(this.domElement.shadowRoot?.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR) ?? [])]
  }

  /** Focus theme row `row`, and give it the tab stop. */
  private focusRow(row: HTMLButtonElement): void {
    this.tabStopTheme = row.value
    row.focus()
  }

  /**
   * Follow the overlay:  `isOpen` from its `ui-open` / `ui-close`, and focus the chosen theme once it shows
   * (`toggle`), its tab stop reset to it.
   */
  private wireOverlay(popup: HTMLElement): void {
    popup.addEventListener("ui-open", (event) => {
      if (!event.defaultPrevented) this.isOpen = true
    })
    popup.addEventListener("ui-close", (event) => {
      if (!event.defaultPrevented) this.isOpen = false
    })
    popup.addEventListener("toggle", (event) => {
      if ((event as ToggleEvent).newState !== "open") return
      this.tabStopTheme = undefined
      const row = this.rows().find((each) => each.value === untrack(() => this.chosenTheme)) ?? this.rows()[0]
      row?.focus()
    })
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIDocsThemes extends E.AttributeValues<DocsThemesVocabulary> {}

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

/**
 * ARIA of the overlay's theme list:  a menu of radio items (arrows move, Enter / Space / click picks), and its switch.
 */
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
