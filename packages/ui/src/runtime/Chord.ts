import { Browser } from "./Browser"

/****************
 * ### `Chord`
 * One keyboard shortcut, e.g. `Mod+Shift+K`, `Escape`, `Alt+ArrowUp`, `?`.
 * - In the runtime's lazy chunk, with `Keyboard`;  imports only `Browser` (its platform sniff), so tests use it alone.
 * - Parse once with `Chord.parse()`, then test events with `matches()`.
 * - Syntax:  modifiers then one key, joined by `+`, case-insensitive:
 *   - modifiers:  `Mod` (Meta on Apple, Ctrl elsewhere), `Ctrl` / `Control`, `Meta` / `Cmd` / `Command`,
 *     `Alt` / `Option`, `Shift`
 *   - key:  any `KeyboardEvent.key` (`ArrowDown`, `Enter`, `k`, `/`), plus aliases `Esc`, `Space`, `Up`,
 *     `Down`, `Left`, `Right`, `Del`, `Plus`;  a trailing `++` means the `+` key
 * - Modifiers match EXACTLY:  `Mod+K` does not fire for `Mod+Shift+K`.
 *   - Exception:  a symbol key without `Shift` in the chord ignores Shift, since `?` / `+` need it on most layouts.
 * - Letters and digits also match by `event.code` (`KeyK`, `Digit1`), so `Alt+K` still fires on macOS,
 *   where Option turns `event.key` into `˚`.
 ****************/
export class Chord {
  /** normalized key:  lowercased, aliases resolved, e.g. `"k"`, `"arrowdown"`, `" "` */
  readonly key: string
  /** Ctrl must be down */
  readonly ctrl: boolean
  /** Meta (Cmd / Windows key) must be down */
  readonly meta: boolean
  /** Alt (Option) must be down */
  readonly alt: boolean
  /** Shift must be down */
  readonly shift: boolean

  constructor({ key, ctrl = false, meta = false, alt = false, shift = false }: ChordProps) {
    this.key = Chord.normalizeKey(key)
    this.ctrl = ctrl
    this.meta = meta
    this.alt = alt
    this.shift = shift
  }

  /** True when any of Ctrl / Meta / Alt is part of the chord -- such chords fire inside editable fields. */
  get hasCommandModifier(): boolean {
    return this.ctrl || this.meta || this.alt
  }

  /** Canonical text, e.g. `"Ctrl+Shift+k"`;  equal chords give equal strings (used for conflict detection). */
  toString(): string {
    const names = [this.ctrl && "Ctrl", this.meta && "Meta", this.alt && "Alt", this.shift && "Shift"]
    return [...names.filter(Boolean), this.key === " " ? "Space" : this.key].join("+")
  }

  /** Does `event` press this chord?  See class docs for the Shift and `event.code` rules. */
  matches(event: KeyboardEvent): boolean {
    if (event.ctrlKey !== this.ctrl || event.metaKey !== this.meta || event.altKey !== this.alt) return false
    if (event.shiftKey !== this.shift && !(this.isSymbol && !this.shift)) return false
    if (Chord.normalizeKey(event.key ?? "") === this.key) return true
    return this.code !== undefined && event.code === this.code
  }

  ////////////////
  // ## Internals
  ////////////////

  /** Single printable character that isn't a letter or digit, e.g. `?`, `/`, `+`. */
  private get isSymbol(): boolean {
    return this.key.length === 1 && !/[\p{L}\p{N}\s]/u.test(this.key)
  }

  /** `event.code` for letter / digit keys (`KeyK`, `Digit1`), else `undefined`. */
  private get code(): string | undefined {
    if (/^[a-z]$/.test(this.key)) return `Key${this.key.toUpperCase()}`
    if (/^[0-9]$/.test(this.key)) return `Digit${this.key}`
    return undefined
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Parse `text` like `"Mod+Shift+K"`.
   * - STATIC:  the factory, called before there's a chord to call it on.
   * - `isApple` decides what `Mod` means;  defaults to sniffing `navigator` (the runtime passes `UI.browser.isApple`).
   * - Throws a `SyntaxError` on an unknown modifier or a missing key, so a typo in a shortcut fails at registration,
   *   not silently never firing.
   */
  static parse(text: string, { isApple = Browser.isApplePlatform() }: { isApple?: boolean } = {}): Chord {
    const parts = text.endsWith("++") ? [...text.slice(0, -2).split("+"), "+"] : text.split("+")
    const key = parts.pop()?.trim()
    if (!key) throw new SyntaxError(`Chord.parse():  no key in ${JSON.stringify(text)};  end it with one, e.g. "Mod+K"`)
    const modifiers = { ctrl: false, meta: false, alt: false, shift: false }
    for (const part of parts) {
      const modifier = MODIFIER_ALIASES[part.trim().toLowerCase()]
      if (!modifier) {
        throw new SyntaxError(
          `Chord.parse():  unknown modifier ${JSON.stringify(part)} in ${JSON.stringify(text)};  ` +
            `use Mod, Ctrl, Meta, Alt or Shift`
        )
      }
      if (modifier === "mod") modifiers[isApple ? "meta" : "ctrl"] = true
      else modifiers[modifier] = true
    }
    return new Chord({ key, ...modifiers })
  }

  /**
   * Lowercase `key` and resolve aliases (`Esc` -> `escape`, `Space` -> `" "`).
   * - STATIC:  pure, and the constructor needs it before the fields it would read exist.
   */
  private static normalizeKey(key: string): string {
    if (key === " ") return key
    const lower = key.toLowerCase()
    return KEY_ALIASES[lower] ?? lower
  }
}

/** Constructor props for `Chord`:  the key, and which modifiers must be down (default none). */
export type ChordProps = {
  /** any `KeyboardEvent.key`, or an alias (`Esc`, `Space` ...);  normalized by the constructor */
  key: string
  /** Ctrl must be down */
  ctrl?: boolean
  /** Meta (Cmd / Windows key) must be down */
  meta?: boolean
  /** Alt (Option) must be down */
  alt?: boolean
  /** Shift must be down */
  shift?: boolean
}

/** Modifier words accepted by `Chord.parse()`, lowercased -> canonical. */
const MODIFIER_ALIASES: Record<string, "mod" | "ctrl" | "meta" | "alt" | "shift" | undefined> = {
  mod: "mod",
  ctrl: "ctrl",
  control: "ctrl",
  meta: "meta",
  cmd: "meta",
  command: "meta",
  alt: "alt",
  option: "alt",
  shift: "shift"
}

/** Key aliases accepted by `Chord.parse()`, lowercased -> lowercased `KeyboardEvent.key`. */
const KEY_ALIASES: Record<string, string | undefined> = {
  esc: "escape",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  plus: "+"
}
