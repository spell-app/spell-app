import type { monaco } from "spell-app/app/ui/monaco/monaco"

// Above the class:  its static `dark` and `light` read it while the class is defined
/** Heading levels with a semantic modifier of their own:  `heading1` ... `heading4` (`TOKEN_LEGEND`). */
const HEADING_LEVELS = [1, 2, 3, 4]

/****************
 * ### `ShadesOfPurple`
 * The code's colours in the editor, "Purple":  Ahmad Awais's Shades of Purple VS Code theme, for Monaco, in dark
 * and a matching light (epic `debut` Q12, Q13).
 * - DARK:  ported from the VS Code theme (`shades-of-purple-color-theme.json`, v7.3.6;  MIT, (c) Ahmad Awais):
 *   its editor colours, and its token colours by what they colour (keywords orange, types yellow, strings green ...).
 * - LIGHT:  ours, the same hues darkened to read on a pale lavender page:
 *   the Studio board's light code, on the "Spell editor facelift" Design canvas.
 * - Rules for spell's OWN token names, as both colourings name them:
 *   - the instant colouring's scopes (`SpellTokensProvider`):  `comment.header` (a `#` heading), `comment`, `string`,
 *     `number`, `operator`, `identifier`, and `tag` / `delimiter` round a `<css>` block
 *     - a `.spellx` tag's too:  its word a `keyword`, its attributes' names `attribute.name`, its `<`, `>` and closers
 *       `delimiter`
 *   - the parse's semantic token types (`LSP.SpellLanguageService.TOKEN_LEGEND`):  `keyword`, `type`, `variable`,
 *     `parameter`, `property`, `function`, `enumMember` ...;
 *     Monaco matches a token with modifiers as `type.modifier`, so `comment.heading2` is a `##` heading
 *   - Monaco's own colouring of `<css>` and `<markdown>` blocks:  `attribute.name`, `attribute.value`, `keyword.md` ...
 * - Data only:  `CodeThemes` defines them with Monaco, and picks one by the page's light / dark.
 ****************/
export class ShadesOfPurple {
  /** Monaco's name of the dark theme. */
  static DARK = "spell-purple-dark"

  /** Monaco's name of the light theme. */
  static LIGHT = "spell-purple-light"

  /** The dark theme:  Shades of Purple itself. */
  static dark: monaco.editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: true,
    rules: ShadesOfPurple.rules({
      text: "E1EFFF",
      heading: "B362FF",
      comment: "B362FF",
      keyword: "FF9D00",
      type: "FAD000",
      library: "80FFBB",
      name: "E1EFFF",
      member: "9EFFFF",
      parameter: "FFEE80",
      action: "9EFFFF",
      constant: "FF628C",
      string: "A5FF90",
      tag: "FB94FF",
      punctuation: "A599E9"
    }),
    colors: {
      "editor.background": "#2D2B55",
      "editor.foreground": "#E1EFFF",
      "editorLineNumber.foreground": "#A599E9",
      "editorLineNumber.activeForeground": "#FAD000",
      "editorCursor.foreground": "#FAD000",
      "editor.selectionBackground": "#B362FF88",
      "editor.inactiveSelectionBackground": "#B362FF44",
      "editor.selectionHighlightBackground": "#7E46DF46",
      "editor.lineHighlightBackground": "#1F1F41",
      "editor.lineHighlightBorder": "#1F1F41",
      "editor.findMatchBackground": "#FF7300AB",
      "editor.findMatchHighlightBackground": "#FFFFFF26",
      "editorBracketMatch.border": "#AD70FC46",
      "editorBracketMatch.background": "#AD70FC1A",
      "editorIndentGuide.background1": "#A599E91A",
      "editorIndentGuide.activeBackground1": "#A599E94D",
      "editorWhitespace.foreground": "#FFFFFF1A",
      "editorGutter.background": "#28284E",
      "editorWidget.background": "#222244",
      "editorSuggestWidget.background": "#1F1F41",
      "editorSuggestWidget.selectedBackground": "#2D2B55",
      "editorSuggestWidget.border": "#A599E94D",
      "editorHoverWidget.background": "#161633",
      "editorHoverWidget.border": "#A599E94D",
      "editorError.foreground": "#EC3A37F5",
      "editorWarning.foreground": "#FAD000",
      "scrollbarSlider.background": "#A599E981",
      "scrollbarSlider.hoverBackground": "#A599E9AA"
    }
  }

  /** The light theme:  the same hues, darker, on pale lavender. */
  static light: monaco.editor.IStandaloneThemeData = {
    base: "vs",
    inherit: true,
    rules: ShadesOfPurple.rules({
      text: "2D2B55",
      heading: "7B2FD6",
      comment: "7B2FD6",
      keyword: "A84700",
      type: "7A5D00",
      library: "1F7A52",
      name: "2D2B55",
      member: "006D77",
      parameter: "8A5A00",
      action: "006D77",
      constant: "C2185B",
      string: "2B7A1F",
      tag: "9C27B0",
      punctuation: "565196"
    }),
    colors: {
      "editor.background": "#FBFAFF",
      "editor.foreground": "#2D2B55",
      "editorLineNumber.foreground": "#8C87C2",
      "editorLineNumber.activeForeground": "#6A2BC2",
      "editorCursor.foreground": "#6A2BC2",
      "editor.selectionBackground": "#B362FF40",
      "editor.inactiveSelectionBackground": "#B362FF26",
      "editor.selectionHighlightBackground": "#7E46DF1F",
      "editor.lineHighlightBackground": "#F1EEFF",
      "editor.lineHighlightBorder": "#F1EEFF",
      "editorBracketMatch.border": "#AD70FC80",
      "editorBracketMatch.background": "#AD70FC1A",
      "editorIndentGuide.background1": "#2D2B5514",
      "editorIndentGuide.activeBackground1": "#2D2B5533",
      "editorGutter.background": "#F6F4FF",
      "editorWidget.background": "#F6F4FF",
      "editorSuggestWidget.background": "#F6F4FF",
      "editorSuggestWidget.selectedBackground": "#E9E5FF",
      "editorSuggestWidget.border": "#D3CCF5",
      "editorHoverWidget.background": "#F6F4FF",
      "editorHoverWidget.border": "#D3CCF5",
      "scrollbarSlider.background": "#8C87C259",
      "scrollbarSlider.hoverBackground": "#8C87C288"
    }
  }

  /**
   * Monaco's token rules for one scheme's `ink`:  spell's names, and the embedded blocks'.
   * - Headings bold and italic (the `#` comments that title a part of a file), comments italic.
   */
  static rules(ink: PurpleInk): monaco.editor.ITokenThemeRule[] {
    const rule = (token: string, foreground: string, fontStyle?: string): monaco.editor.ITokenThemeRule =>
      fontStyle ? { token, foreground, fontStyle } : { token, foreground }
    return [
      rule("", ink.text),
      rule("identifier", ink.name),
      rule("comment", ink.comment, "italic"),
      rule("comment.header", ink.heading, "bold italic"),
      ...HEADING_LEVELS.map((level) => rule(`comment.heading${level}`, ink.heading, "bold italic")),
      rule("keyword", ink.keyword),
      rule("operator", ink.punctuation),
      rule("delimiter", ink.punctuation),
      rule("type", ink.type),
      rule("type.defaultLibrary", ink.library),
      rule("class", ink.type),
      rule("variable", ink.name),
      rule("property", ink.member),
      rule("parameter", ink.parameter),
      rule("function", ink.action),
      rule("enumMember", ink.constant),
      rule("number", ink.constant),
      rule("string", ink.string),
      rule("tag", ink.tag),
      rule("attribute.name", ink.member),
      rule("attribute.value", ink.string),
      rule("keyword.md", ink.heading, "bold"),
      rule("string.link.md", ink.member),
      rule("variable.md", ink.member),
      rule("emphasis", ink.text, "italic"),
      rule("strong", ink.text, "bold")
    ]
  }
}

/** One scheme's colours, by what they colour:  hex, no `#` (Monaco's rule format). */
export type PurpleInk = {
  /** plain code */
  text: string
  /** a `#` heading comment */
  heading: string
  /** a comment */
  comment: string
  /** spell's own words:  `a`, `is a`, `has a`, `if its` ... */
  keyword: string
  /** a type's name:  `task`, `text` */
  type: string
  /** a type spell itself defines (`text`, `number`) */
  library: string
  /** a variable's name */
  name: string
  /** a property's name */
  member: string
  /** a parameter's name */
  parameter: string
  /** an action's (method's) name */
  action: string
  /** a constant:  a number, `yes`, one of a list of choices */
  constant: string
  /** text in quotes */
  string: string
  /** a drawing's tag (`<ui-form>`) */
  tag: string
  /** symbols and punctuation */
  punctuation: string
}
