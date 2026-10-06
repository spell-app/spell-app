import { NativeFallback, proto, UI } from "$/ui/core"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"

import { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"
import { ThemeMenu } from "./ThemeMenu"
import { DEFAULT_VALUE, type DocsThemesChange, type DocsThemesText } from "./ui-docs-themes.types"

/****************
 * ### `DocsThemesFallback`
 * `<div part="controls" class="ui ... themes">` holding, by `show`, a native `<select part="theme">` (Spell, Plain,
 * Classic, an `<optgroup>` of the Fomantic themes), a plain `<button part="scheme">` (`Switch to dark` /
 * `Switch to light`) and a "Match system" `<label part="system">` checkbox, wired to `ThemePreference` like the
 * element:  a change still applies, persists and fires `ui-change`.
 * - Native elements only;  English text from the vocabulary;  no site data, so every theme is listed (`for` is
 *   ignored) under its sheet name.  `both` shows all three, inline:  no overlay.
 ****************/
export class DocsThemesFallback extends NativeFallback<typeof docsThemesVocabulary> {
  @proto static vocabulary = docsThemesVocabulary
  @proto static degraded = [
    "a native `<select>`, button and checkbox, inline:  no icon buttons, no overlay",
    "`for` is ignored:  every theme is listed, titled by sheet name",
    "doesn't follow other pickers' changes, or the OS's, until re-rendered"
  ]

  protected override build() {
    const show = this.attr("show") ?? "both"
    const children: Node[] = []
    if (show !== "scheme") children.push(this.select(ThemePreference.look.theme))
    if (show !== "theme") children.push(this.schemeButton())
    if (show === "both") children.push(this.systemBox())
    return [this.decorate(this.create("div", { class: this.classes() }, ...children), "controls")]
  }

  /** The theme `<select>`, `theme` chosen. */
  private select(theme: string | undefined): HTMLSelectElement {
    const menu = new ThemeMenu(UI.themes.names, undefined, undefined)
    const select = this.create("select", { "aria-label": DocsThemesFallback.english("themeName") })
    select.setAttribute("part", "theme")
    let group: HTMLElement = select
    for (const entry of menu.entries(DocsThemesFallback.english)) {
      if ("type" in entry) {
        if (entry.type === "header") select.append((group = this.create("optgroup", { label: entry.text })))
        continue
      }
      const option = this.create("option", { value: entry.value }, entry.text)
      option.selected = entry.value === (theme ?? DEFAULT_VALUE)
      group.append(option)
    }
    this.listen(select, "change", (event) => {
      void ThemePreference.setTheme(select.value === DEFAULT_VALUE ? undefined : select.value)
      this.changed(event)
    })
    return select
  }

  /** The scheme button:  says what a click does, and flips the scheme the page shows. */
  private schemeButton(): HTMLButtonElement {
    const button = this.create("button", { type: "button", part: "scheme" }, DocsThemesFallback.flipText())
    this.listen(button, "click", (event) => {
      ThemePreference.flipScheme()
      button.textContent = DocsThemesFallback.flipText()
      const box = button.parentElement?.querySelector<HTMLInputElement>("input[type=checkbox]")
      if (box) box.checked = false
      this.changed(event)
    })
    return button
  }

  /** The "Match system" checkbox, in its `<label part="system">`:  checked while following the OS. */
  private systemBox(): HTMLLabelElement {
    const box = this.create("input", { type: "checkbox" })
    box.checked = ThemePreference.look.scheme === "system"
    const label = this.create("label", { part: "system" }, box, ` ${DocsThemesFallback.english("matchSystem")}`)
    this.listen(box, "change", (event) => {
      ThemePreference.setScheme(box.checked ? "system" : ThemePreference.shownScheme())
      const button = label.parentElement?.querySelector<HTMLButtonElement>("button[part=scheme]")
      if (button) button.textContent = DocsThemesFallback.flipText()
      this.changed(event)
    })
    return label
  }

  /** Fire the host's `ui-change` with the look now. */
  private changed(originalEvent: Event): void {
    const { theme, scheme } = ThemePreference.look
    const detail: DocsThemesChange = {
      ...(theme !== undefined && { theme }),
      scheme,
      shown: ThemePreference.shownScheme(),
      originalEvent
    }
    this.host.dispatchEvent(new CustomEvent("ui-change", { detail, bubbles: true, composed: true }))
  }

  /** What a click on the scheme button does, in English:  `Switch to dark` on a light page. */
  private static flipText(): string {
    return DocsThemesFallback.english(ThemePreference.shownScheme() === "dark" ? "toLight" : "toDark")
  }

  /** English text `key` from the vocabulary, `{param}`s filled in. */
  private static readonly english: DocsThemesText = (key, params = {}) => {
    const text = docsThemesVocabulary.texts.find((entry) => entry.key === key)?.text ?? key
    return text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
  }
}
