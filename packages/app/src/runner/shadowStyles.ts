/**
 * Styles for our elements' shadow roots -- `<spell-app>`'s:  Semantic UI, and the bundle's own `spell-app.css`.
 * - `<spell-editor>` names its own files, e.g. `spell-editor.css`.
 * - A shadow root sees only its own styles, so each adopts these -- one `CSSStyleSheet` each, built ONCE per
 *   page and shared by every element.
 * - `@font-face` rules DON'T work inside a shadow root, so they go in the page's `<head>` instead, with Lato's.
 *   They only name fonts:  nothing else of ours leaks into the page.
 * - Relative `url(...)`s are made absolute:  an adopted sheet resolves them against the PAGE, not its file.
 */

/**
 * Stylesheets for a shadow root:  CSS `files` of `assets` -- where they are, and Lato.
 * - Default `files`, `<spell-app>`'s:  Semantic UI and `spell-app.css`.
 */
export function shadowStyles(assets: string, files = SPELL_APP_CSS): Promise<CSSStyleSheet[]> {
  const key = JSON.stringify([assets, files])
  let sheets = built.get(key)
  if (!sheets) built.set(key, (sheets = buildSheets(assets, files)))
  return sheets
}

/**
 * Adopt `shadowStyles(assets, files)` into `root`, once they're built:  before the sheets already there (Spell UI's,
 * which keeps ours where they are when it re-adopts its own).
 * - NEVER throws:  a sheet that can't load is logged, and the element draws without it.
 */
export async function adoptShadowStyles(root: ShadowRoot, assets: string, files?: string[]): Promise<void> {
  try {
    const sheets = await shadowStyles(assets, files)
    root.adoptedStyleSheets = [...sheets, ...root.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))]
  } catch (error) {
    console.error(`<${(root.host as Element).localName}> couldn't load its styles from ${assets}:`, error)
  }
}

/** `<spell-app>`'s CSS files -- see `shadowStyles()`. */
const SPELL_APP_CSS = ["semantic-ui-css/semantic.min.css", "spell-app.css"]

/** Sheets built, by `assets` URL and files. */
const built = new Map<string, Promise<CSSStyleSheet[]>>()

/** Fetch and build the sheets of `names` from `assets` -- see `shadowStyles()`.  SIDE EFFECT:  fonts go in the page's `<head>`. */
async function buildSheets(assets: string, names: string[]): Promise<CSSStyleSheet[]> {
  const files = await Promise.all(names.map((file) => cssAt(assets, file)))
  addFonts(
    files.flatMap((file) => file.fonts),
    new URL("lato/index.css", assets).href
  )
  return files.map(({ rules }) => {
    const sheet = new CSSStyleSheet()
    // NOTE: `@import`s are dropped -- Semantic's Google Fonts one included, as we bring our own Lato
    sheet.replaceSync(rules)
    return sheet
  })
}

/** CSS file `file` of `assets`, its `url()`s absolute -- its `@font-face` rules apart from the rest. */
async function cssAt(assets: string, file: string): Promise<{ rules: string; fonts: string[] }> {
  const url = new URL(file, assets).href
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Couldn't load ${url}:  ${response.status}`)
  const css = absoluteUrls(await response.text(), url)
  return { rules: css.replace(FONT_FACE, ""), fonts: css.match(FONT_FACE) ?? [] }
}

/** An `@font-face` rule. */
const FONT_FACE = /@font-face\s*\{[^}]*\}/g

/**
 * `css` with relative `url(...)`s made absolute against `base` -- `data:` and full URLs left alone.
 * - Pure.
 */
export function absoluteUrls(css: string, base: string): string {
  return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (whole, quote: string, url: string) => {
    if (/^(data:|[a-z][\w+.-]*:)/i.test(url)) return whole
    return `url(${quote}${new URL(url, base).href}${quote})`
  })
}

/**
 * Add `fonts`, and Lato's stylesheet at `lato`, to the page's `<head>` -- each once.
 * - Each element's files bring their own, e.g. `<spell-editor>`'s Monaco icons:  a font already there is skipped.
 */
function addFonts(fonts: string[], lato: string) {
  const added = new Set(Array.from(document.querySelectorAll("style[data-spell-app-fonts]"), (it) => it.textContent))
  const style = document.createElement("style")
  style.dataset.spellAppFonts = ""
  style.textContent = fonts.filter((font) => !added.has(font)).join("\n")
  if (style.textContent) document.head.append(style)
  if (!document.querySelector(`link[href="${lato}"]`)) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = lato
    document.head.append(link)
  }
}
