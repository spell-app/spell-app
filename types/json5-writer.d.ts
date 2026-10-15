/**
 * Types for `json5-writer`, which ships none (decision J41):  what spaces' `json5.ts` uses of it.
 * - Here, in the root's `types/`, so every package compiling spaces' node code sees them (its tests, cli, lsp ...).
 * - `load(source)`:  a writer on JSON5 text
 * - `write(value)`:  replaces its value, keeping comments
 * - `toSource()`:  its text again
 */
declare module "json5-writer" {
  /** How `toSource()` writes:  quotes, key quotes, trailing commas. */
  type SourceOptions = { quote?: "single" | "double"; quoteKeys?: boolean; trailingComma?: boolean }

  /** A writer on one JSON5 text. */
  type Writer = {
    /** Replace the value, keeping comments:  a key `value` leaves out is removed;  `undefined` keeps a key as it is. */
    write(value: unknown): void
    /** The JSON5 text, as `options` say. */
    toSource(options?: SourceOptions): string
    /** The text as plain JSON. */
    toJSON(options?: SourceOptions): string
  }

  const json5Writer: { load(source?: string): Writer }
  export default json5Writer
}
