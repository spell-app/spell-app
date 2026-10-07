/**
 * Types shared across `$/assembler`.
 * - MUST stay runtime-light:  no imports at all, so nothing here loads a class module (WWOD §8).
 */

////////////////
// ## Links
////////////////

/** What `Linker.link()` did to a page's text. */
export type LinkResult = {
  /** the page's text, its code spans linked and every link given a target */
  text: string
  /** how many code spans became links */
  linked: number
  /** path-like code spans that resolve to nothing, sorted */
  unresolved: string[]
}

/** What `Linker.check()` found in a page's links, outside `<pre>`. */
export type LinkCheck = {
  /** how many distinct destinations the targeted links have */
  destinations: number
  /** one line per problem, e.g. `missing:  nope.html`;  empty when the page passes */
  problems: string[]
}
