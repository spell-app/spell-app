/**
 * A project's words in a runner:  spell's wording of each member of its types, by the name its compiled code uses,
 * from its `<Project>.en.js` -- for the Thing Explorer's labels.  See `SP.SpellWords`.
 * - Loaded beside the scope pack:  the compiled code doesn't import it.
 * - Optional, like the scope pack:  a project compiled before words had a file just shows today's names.
 */
import type { SP } from "$/spell"
import { fetchText } from "./fetchFresh"

/**
 * Words of the words file at `url` -- `undefined` if there's no `url`, nothing there, or it isn't one.
 * - Fetched afresh, as the compiled code is:  it changes whenever the project's recompiled.
 * - NEVER throws.
 */
export async function wordsAt(url: string | undefined): Promise<SP.SpellWordsData | undefined> {
  if (!url) return undefined
  const text = await fetchText(url).catch(() => undefined)
  return text === undefined ? undefined : wordsIn(text)
}

/**
 * Words in `text`, a words file's module -- `undefined` if it isn't one.
 * - Imported, as the compiled code is, from a `blob:` URL:  so it loads wherever that came from, `file:` too.
 *   NOT `JSON5`, as `SP.SpellWords.read()` reads it:  that stays out of the runner's bundle.
 * - NEVER throws.
 */
export async function wordsIn(text: string): Promise<SP.SpellWordsData | undefined> {
  const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }))
  try {
    const { words } = (await import(/* @vite-ignore */ url)) as { words?: Partial<SP.SpellWordsData> }
    return isWords(words) ? words : undefined
  } catch {
    return undefined
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * `all` the words a run has -- its program's, then each project's it imports -- as one:
 * a type's words from the first that has it.  `undefined` if there are none.
 */
export function mergedWords(all: Array<SP.SpellWordsData | undefined>): SP.SpellWordsData | undefined {
  const present = all.filter((words) => words !== undefined)
  if (!present.length) return undefined
  const types: SP.SpellWordsData["types"] = {}
  for (const words of present) {
    for (const [type, members] of Object.entries(words.types)) types[type] ??= members
  }
  return { lang: present[0]!.lang, types }
}

/** Is `words` what a words file exports? */
function isWords(words: Partial<SP.SpellWordsData> | undefined): words is SP.SpellWordsData {
  return typeof words?.lang === "string" && !!words.types && typeof words.types === "object"
}
