import { SP } from "spell-parser/spell"
import { ROOT_CATALOG } from "spell-ui/components/ui-root/UIRoot.catalog"
import { es } from "spell-ui/components/components.es"

/**
 * Spell UI as a spellx drawing names its components, bare (epic `elemental-spell` P7, Q46):
 * `<button>` is `<ui-button>`, `<botón>` in a Spanish file `<es-boton>`.
 * - English:  every tag in Spell UI's catalog, without its `ui-`.
 * - Spanish:  each tag's Spanish name from Spell UI's dictionary, `es-` before it, as a Spanish page reads it;
 *   accents count as written or not (`botón` ~== `boton`).
 * - SIDE EFFECT:  loading this registers it with spell as `"spell-ui"` (`SP.ComponentPacks`), the pack every
 *   project draws with unless its project file says otherwise:  spell-parser never imports Spell UI.
 * - Loaded by spaces' barrel, as every program that compiles a project loads it;  NOT by `<spell-viewer>`, which runs
 *   built code and never compiles a drawing.
 */
export const SPELL_UI_PACK: SP.ComponentPack = {
  name: "spell-ui",
  tagFor(word, language) {
    return tagsFor(language).get(unaccented(word))
  }
}

/** Each language's bare names => tags, made the first time it's asked for. */
const TAGS_BY_LANGUAGE = new Map<string, Map<string, string>>()

/** `language`'s bare names => Spell UI's tags:  English's from the catalog, Spanish's from its dictionary. */
function tagsFor(language: string): Map<string, string> {
  let tags = TAGS_BY_LANGUAGE.get(language)
  if (tags) return tags
  tags = new Map()
  if (language === "es") {
    for (const name of Object.values(es.tags ?? {})) tags.set(unaccented(name), `es-${name}`)
  } else {
    for (const tag of Object.keys(ROOT_CATALOG)) tags.set(tag.replace(/^ui-/, ""), tag)
  }
  TAGS_BY_LANGUAGE.set(language, tags)
  return tags
}

/** `word` without its accents:  `botón` => `boton`. */
function unaccented(word: string): string {
  return word.normalize("NFD").replace(/\p{M}/gu, "")
}

SP.ComponentPacks.register(SPELL_UI_PACK)
