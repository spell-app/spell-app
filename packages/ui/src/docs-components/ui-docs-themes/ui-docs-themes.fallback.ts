import { E, UI, UIT } from "$/ui/core"
import { DOCS_PLAIN_THEME, VocabularyTexts } from "$/ui/docs-components/docs-components.types"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import { ThemeMenu } from "./ThemeMenu"
import { DocsThemesChanges, type DocsThemesText } from "./ui-docs-themes.types"
import { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"

/****************
 * ### `DocsThemesFallback`
 * `<div part="controls" class="ui ... themes">` holding, by `show`, a native `<select part="theme">` (Spell, Plain,
 * Classic, an `<optgroup>` of the Fomantic themes), a plain `<button part="scheme">` (`Switch to dark` /
 * `Switch to light`) and a "Match system" `<label part="system">` checkbox, wired to `ThemePreference` like the
 * element:  a change still applies, persists and fires `ui-change`.
 * - Native elements only;  English text from the vocabulary;  no site data, so every theme is listed (`for` is
 *   ignored) under its sheet name.  `both` shows all three, inline:  no overlay.
 * - The inner controls get their `part` alone, not `decorate()`:  the host's `aria-*` would rename each of them.
 ****************/
export class DocsThemesFallback extends E.NativeFallback<typeof docsThemesVocabulary> {
  @E.proto static vocabulary = docsThemesVocabulary
  @E.proto static degraded = [
    "a native `<select>`, button and checkbox, inline:  no icon buttons, no overlay",
    "`for` is ignored:  every theme is listed, titled by sheet name",
    "doesn't follow other pickers' changes, or the OS's, until re-rendered"
  ]

  /** The scheme button, once built (`show` isn't `theme`). */
  private schemeButton: HTMLButtonElement | undefined

  /** The "Match system" checkbox, once built (`show` is `both`). */
  private systemBox: HTMLInputElement | undefined

  protected override build() {
    const show = this.attr("show") ?? "both"
    const children: Node[] = []
    if (show !== "scheme") children.push(this.select(ThemePreference.look.theme))
    if (show !== "theme") children.push(this.scheme())
    if (show === "both") children.push(this.system())
    return [this.decorate(this.create("div", { class: this.classes() }, ...children), "controls")]
  }

  /** The theme `<select>`, `theme` chosen. */
  private select(theme: string | undefined): HTMLSelectElement {
    const menu = new ThemeMenu({ names: UI.themes.names, data: undefined, text: DocsThemesFallback.english })
    const select = this.create("select", {
      [UIT.ARIA_LABEL]: DocsThemesFallback.english("themeName"),
      part: PARTS.theme
    })
    let group: HTMLElement = select
    for (const entry of menu.entries) {
      if ("type" in entry) {
        if (entry.type === "header") select.append((group = this.create("optgroup", { label: entry.text })))
        continue
      }
      const option = this.create("option", { value: entry.value }, entry.text)
      option.selected = entry.value === (theme ?? DOCS_PLAIN_THEME)
      group.append(option)
    }
    this.listen(select, "change", (event) => {
      void ThemePreference.setTheme(select.value === DOCS_PLAIN_THEME ? undefined : select.value)
      this.changed(event)
    })
    return select
  }

  /** The scheme button:  says what a click does, and flips the scheme the page shows. */
  private scheme(): HTMLButtonElement {
    const button = this.create("button", { type: "button", part: PARTS.scheme }, DocsThemesFallback.flipText())
    this.schemeButton = button
    this.listen(button, "click", (event) => {
      ThemePreference.flipScheme()
      button.textContent = DocsThemesFallback.flipText()
      if (this.systemBox) this.systemBox.checked = false
      this.changed(event)
    })
    return button
  }

  /** The "Match system" checkbox, in its `<label part="system">`:  checked while following the OS. */
  private system(): HTMLLabelElement {
    const box = this.create("input", { type: "checkbox" })
    box.checked = ThemePreference.look.scheme === "system"
    this.systemBox = box
    const label = this.create("label", { part: PARTS.system }, box, ` ${DocsThemesFallback.english("matchSystem")}`)
    this.listen(box, "change", (event) => {
      ThemePreference.setScheme(box.checked ? "system" : ThemePreference.shownScheme())
      if (this.schemeButton) this.schemeButton.textContent = DocsThemesFallback.flipText()
      this.changed(event)
    })
    return label
  }

  /** Fire the host's `ui-change` with the look now. */
  private changed(originalEvent: Event): void {
    const look = ThemePreference.look
    const detail = DocsThemesChanges.detailFor({ look, shown: ThemePreference.shownScheme(), originalEvent })
    this.host.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail, bubbles: true, composed: true }))
  }

  /**
   * What a click on the scheme button does, in English:  `Switch to dark` on a light page.
   * - Static:  reads only `ThemePreference`, page-wide.
   */
  private static flipText(): string {
    return DocsThemesFallback.english(ThemePreference.shownScheme() === "dark" ? "toLight" : "toDark")
  }

  /**
   * English text `key` from the vocabulary, `{param}`s filled in.
   * - Static:  pure;  an arrow, as `ThemeMenu` takes it as its `text`.
   */
  private static readonly english: DocsThemesText = (key, params) =>
    VocabularyTexts.english(docsThemesVocabulary, key, params)
}

/** The inner controls' parts (the vocabulary's names). */
const PARTS = {
  theme: "theme",
  scheme: "scheme",
  system: "system"
} as const satisfies Record<string, E.PartName<typeof docsThemesVocabulary>>

/** The event a change fires, as the element's. */
const CHANGE_EVENT: E.EventName<typeof docsThemesVocabulary> = "ui-change"
