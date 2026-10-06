/****************
 * ### `Warnings`
 * The ONE way `@spell-app/ui` warns the page's developer in the console:  one prefix, one message format.
 * - `ui`'s substitute for WWOD §19's `Logger`, which would add bytes (and colours no browser but Chrome draws) to
 *   every component bundle (epic `wwod-spell-ui`, Q5).
 * - Message format, WWOD §19 › "Message format":  `[@spell-app/ui] <source>:  <what happened>`, then the data as
 *   separate arguments, so the console shows them as objects.  `source` names who warns:  a tag (`<ui-root>`), a
 *   runtime service (`UI.icons`), a method (`Converters.enumValue()`).
 * - Plain DOM-free JS:  no Solid, no runtime;  lives in `$/ui/util`, so `core` and every lazy chunk can use it.
 * - STATIC and instance-free on purpose:  nothing to configure per caller.
 ****************/
export class Warnings {
  /**
   * Warn, in every build:  something the page's author must fix (a bad attribute, a missing sheet, a file that
   * didn't load).
   * - NEVER throws.
   */
  static warn(source: string, message: string, ...data: unknown[]) {
    console.warn(`${PREFIX} ${source}:  ${message}`, ...data)
  }

  /**
   * Warn in development builds only (`import.meta.env.DEV`):  advice a production page shouldn't print, e.g. an
   * unknown attribute value with a "did you mean" suggestion.
   * - `import.meta.env?.DEV` is statically replaced by Vite, so a production build drops the call.
   * - NEVER throws.
   */
  static devWarn(source: string, message: string, ...data: unknown[]) {
    if (import.meta.env?.DEV) Warnings.warn(source, message, ...data)
  }
}

/** What every warning starts with, so `@spell-app/ui`'s are greppable in a busy console. */
const PREFIX = "[@spell-app/ui]"
