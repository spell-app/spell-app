import { createEffect, createMemo, For, Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UIElement } from "$/ui/core"
import { ThemeSheets } from "$/ui/styles"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import {
  DOCS_SCHEMES,
  type DocsLook,
  type DocsScheme,
  type SiteDataFile
} from "$/ui/docs-components/docs-components.types"

import { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"
import { DocsThemesFallback } from "./ui-docs-themes.fallback"
import { ThemeMenu } from "./ThemeMenu"
import {
  DEFAULT_VALUE,
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
 * The docs site's look controls:  `<div class="ui [size] [inverted] themes" part="controls">` holding a theme
 * `<ui-dropdown part="theme" floating scrolling button>` and a light / dark / system `<ui-buttons part="scheme">`
 * (sun / moon / desktop).
 * - The look itself is `ThemePreference`'s (stored per viewer, one per page):  picking calls
 *   `ThemePreference.setTheme()` (=> `ThemeSheets.apply()`, page + shadow roots) / `setScheme()` (=> `ui-light` /
 *   `ui-dark` on `<html>`), then fires `ui-change`.  Every picker on the page follows any picker's change
 *   (`subscribe()`, while connected).
 * - The menu (`ThemeMenu`):  Spell (our own theme, the default), Plain (our own look), Classic, then every Fomantic theme (`ThemeSheets.names`),
 *   titled from the site data (`SiteData`, `components.json` `themes`).  `for="ui-button"`:  only the themes touching
 *   that tag's family, and the dropdown says `N themes` (Fomantic's per-page dropdown).
 * - The dropdown's rows are `<ui-item>` children (Default and Classic with a description, a divider, a header);  its
 *   own text is replaced through its `trigger` slot:  `GitHub theme` / `3 themes`.
 * - The dropdown's inner `ui-change` is stopped here:  the page hears ONE `ui-change`, the host's.
 * - A doc-only element (`src/docs-components/`):  its shadow composes `<ui-dropdown>` and `<ui-buttons>`, which its
 *   barrel imports.
 ****************/
export class UIDocsThemes extends UIElement<DocsThemesVocabulary> {
  @proto static vocabulary = docsThemesVocabulary
  @proto static styles = { "docs-themes": themesCSS }
  @proto static Fallback = DocsThemesFallback
  @proto static delegatesFocus = false

  /** The page's look, as last chosen by any picker. */
  readonly look = new Cell<DocsLook>(isServer ? SERVER_LOOK : untrack(() => ThemePreference.look))

  /** The site data, once loaded:  titles and `for`'s families.  `undefined` before, or if it failed. */
  readonly data = new Cell<SiteDataFile | undefined>(undefined)

  /** What the dropdown lists, for `for`. */
  readonly menu = createMemo(() => new ThemeMenu(ThemeSheets.names, this.data.get(), this.attrs.for))

  /** `text()` as a plain function, for `ThemeMenu`. */
  readonly texts: DocsThemesText = (key, params) => this.text(key, params)

  /** Wired to the site data and `ThemePreference` (see `wire()`). */
  readonly wired: boolean = !isServer && this.wire()

  protected override hostStates() {
    const look = this.look.get()
    return { themed: look.theme !== undefined, dark: look.scheme === "dark" }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("controls")}>
        <Show when={this.show() !== "scheme"}>
          <ui-dropdown
            part={this.part("theme")}
            floating=""
            scrolling=""
            button=""
            basic={this.attrs.inverted ? undefined : ""}
            inverted={this.attrs.inverted ? "" : undefined}
            size={this.attrs.size}
            text={this.text("themeName")}
            value={this.look.get().theme ?? DEFAULT_VALUE}
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
        </Show>
        <Show when={this.show() !== "theme"}>
          <ui-buttons
            part={this.part("scheme")}
            role="group"
            aria-label={this.text("schemeName")}
            basic=""
            icon=""
            inverted={this.attrs.inverted ? "" : undefined}
            size={this.attrs.size}
          >
            <For each={DOCS_SCHEMES}>
              {(scheme) => (
                <ui-button
                  part={this.part(scheme)}
                  icon={SCHEME_ICONS[scheme]}
                  active={this.look.get().scheme === scheme ? "" : undefined}
                  aria-label={this.text(scheme)}
                  title={this.text(scheme)}
                  ref={(button: HTMLElement) =>
                    button.addEventListener("click", (event) => this.pickScheme(scheme, event))
                  }
                />
              )}
            </For>
          </ui-buttons>
        </Show>
      </div>
    )
  }

  /** Choose theme `name` (`undefined`:  our own look), as the viewer did with `event`. */
  async setTheme(name: string | undefined, event?: Event): Promise<void> {
    const applied = ThemePreference.setTheme(name)
    this.emitChange(event)
    await applied
  }

  /** Choose colour scheme `scheme`, as the viewer did with `event`. */
  setScheme(scheme: DocsScheme, event?: Event): void {
    ThemePreference.setScheme(scheme)
    this.emitChange(event)
  }

  ////////////////
  // ## Internals
  ////////////////

  /** `show`, defaulted. */
  private show(): DocsThemesShow {
    return (this.attrs.show as DocsThemesShow | undefined) ?? "both"
  }

  /** The dropdown's `ui-change`:  stop it (the host fires its own), and choose its value. */
  private pickTheme(event: Event): void {
    event.stopPropagation()
    const { value } = (event as CustomEvent<{ value: string }>).detail
    void this.setTheme(value === DEFAULT_VALUE ? undefined : value, event)
  }

  /** A scheme button's click. */
  private pickScheme(scheme: DocsScheme, event: Event): void {
    if (ThemePreference.look.scheme !== scheme) this.setScheme(scheme, event)
  }

  /** Fire `ui-change` with the look now. */
  private emitChange(originalEvent?: Event): void {
    const { theme, scheme } = ThemePreference.look
    const detail: DocsThemesChange = { ...(theme !== undefined && { theme }), scheme, originalEvent }
    this.emit("ui-change", detail)
  }

  /**
   * Load the site data (a promise callback writes it), and follow `ThemePreference` while connected:  catch up
   * on connect (another picker may have changed the look meanwhile), unsubscribe on disconnect.
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
        this.look.set(ThemePreference.look)
        return ThemePreference.subscribe((look) => this.look.set(look))
      }
    )
    return true
  }
}
