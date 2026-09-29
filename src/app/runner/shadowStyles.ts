/**
 * Styles for `<spell-app>`'s shadow roots:  Semantic UI, and the bundle's own `spell-app.css`.
 * - A shadow root sees only its own styles, so each adopts these -- one `CSSStyleSheet` each, built ONCE per
 *   page and shared by every element.
 * - `@font-face` rules DON'T work inside a shadow root, so they go in the page's `<head>` instead, with Lato's.
 *   They only name fonts:  nothing else of ours leaks into the page.
 * - Relative `url(...)`s are made absolute:  an adopted sheet resolves them against the PAGE, not its file.
 */

/** Stylesheets for every `<spell-app>` shadow root, from `assets` -- where Semantic UI, Lato and `spell-app.css` are. */
export function shadowStyles(assets: string): Promise<CSSStyleSheet[]> {
  let sheets = built.get(assets)
  if (!sheets) built.set(assets, (sheets = buildSheets(assets)))
  return sheets
}

/** Sheets built, by `assets` URL. */
const built = new Map<string, Promise<CSSStyleSheet[]>>()

/** Fetch and build the sheets from `assets` -- see `shadowStyles()`.  SIDE EFFECT:  fonts go in the page's `<head>`. */
async function buildSheets(assets: string): Promise<CSSStyleSheet[]> {
  const files = await Promise.all(
    ["semantic-ui-css/semantic.min.css", "spell-app.css"].map((file) => cssAt(assets, file))
  )
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

/** Add `fonts`, and Lato's stylesheet at `lato`, to the page's `<head>` -- once. */
function addFonts(fonts: string[], lato: string) {
  if (document.querySelector("style[data-spell-app-fonts]")) return
  const style = document.createElement("style")
  style.dataset.spellAppFonts = ""
  style.textContent = fonts.join("\n")
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = lato
  document.head.append(style, link)
}
