import { NativeFallback, proto } from "$/ui/core"
import { ThemeSheets } from "$/ui/styles"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import { DOCS_SCHEMES, type DocsScheme } from "$/ui/docs-components/docs-components.types"

import { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"
import { ThemeMenu } from "./ThemeMenu"
import { DEFAULT_VALUE, type DocsThemesChange, type DocsThemesText } from "./ui-docs-themes.types"

/****************
 * ### `DocsThemesFallback`
 * `<div part="controls" class="ui ... themes">` holding a native `<select part="theme">` (Spell, Plain, Classic, an
 * `<optgroup>` of the Fomantic themes) and three `<button part="light|dark|system" aria-pressed>`, wired to
 * `ThemePreference` like the element:  a change still applies, persists and fires `ui-change`.
 * - Native elements only;  English text from the vocabulary;  no site data, so every theme is listed (`for` is
 *   ignored) under its sheet name.
 ****************/
export class DocsThemesFallback extends NativeFallback<typeof docsThemesVocabulary> {
  @proto static vocabulary = docsThemesVocabulary
  @proto static degraded = [
    "a native `<select>` and buttons, no `<ui-dropdown>` / `<ui-buttons>`",
    "`for` is ignored:  every theme is listed, titled by sheet name",
    "doesn't follow other pickers' changes until re-rendered"
  ]

  protected override build() {
    const show = this.attr("show") ?? "both"
    const { theme, scheme } = ThemePreference.look
    const children: Node[] = []
    if (show !== "scheme") children.push(this.select(theme))
    if (show !== "theme") for (const each of DOCS_SCHEMES) children.push(this.button(each, each === scheme))
    return [this.decorate(this.create("div", { class: this.classes() }, ...children), "controls")]
  }

  /** The theme `<select>`, `theme` chosen. */
  private select(theme: string | undefined): HTMLSelectElement {
    const menu = new ThemeMenu(ThemeSheets.names, undefined, undefined)
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

  /** One scheme button, `pressed` if it's the chosen scheme. */
  private button(scheme: DocsScheme, pressed: boolean): HTMLButtonElement {
    const button = this.create(
      "button",
      { type: "button", "aria-pressed": pressed ? "true" : "false", part: scheme },
      DocsThemesFallback.english(scheme)
    )
    this.listen(button, "click", (event) => {
      ThemePreference.setScheme(scheme)
      for (const other of button.parentElement?.querySelectorAll("button") ?? []) {
        other.setAttribute("aria-pressed", String(other === button))
      }
      this.changed(event)
    })
    return button
  }

  /** Fire the host's `ui-change` with the look now. */
  private changed(originalEvent: Event): void {
    const { theme, scheme } = ThemePreference.look
    const detail: DocsThemesChange = { ...(theme !== undefined && { theme }), scheme, originalEvent }
    this.host.dispatchEvent(new CustomEvent("ui-change", { detail, bubbles: true, composed: true }))
  }

  /** English text `key` from the vocabulary, `{param}`s filled in. */
  private static readonly english: DocsThemesText = (key, params = {}) => {
    const text = docsThemesVocabulary.texts.find((entry) => entry.key === key)?.text ?? key
    return text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
  }
}
