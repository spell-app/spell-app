import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { AS } from "$/assembler"

/****************
 * ### `PlanParts`
 * A plan doc in PARTS (epic `claude-design`, P3):  a SKELETON, `epics/<name>/<name>.plan.html`, plus one BODY file
 * per bulky section or item, `epics/<name>/parts/<id>.html`, which the page loads the first time it's opened.  Rules:
 * `PLAN-DOC.md` beside this, "Parts".
 * - the parts' FILES and URLS:  where a part lives (`partFile()`), reading one (`reader()`), rebasing a body's
 *   relative URLs to `parts/` and back (`rebase()`), formatting and writing (`formatHTML()`, `writeChanged()`)
 * - `EpicParts` beside this splits and assembles a doc on them;  so does the converter (`$/epics/convert`), whose
 *   first pass also assembles a doc in the old markup (`OldParts`)
 * - a part is told from a page by its FOLDER, `parts/`:  every page walker skips it (`pages.js` `findPages()`:  the
 *   docs index, `docs update`;  `relocate.js`;  `spell static`), so a part is never taken for a page (Q12)
 * - `.html` only:  the `.htm` of a doc split before Q12 is read no more (epic `epic-components` P15:  every doc was
 *   converted, and its parts written `.html`, at P12)
 * - STATIC:  every helper works on paths, URLs or the element it's given, never a document of its own
 * - Node only (`node:fs`, oxfmt through `$/assembler`):  NOT in the `$/epics` barrel, imported by path.
 ****************/
export class PlanParts {
  ////////////////
  // ## URLs
  ////////////////

  /**
   * Rewrite every relative URL in `element` (itself included) with `change`:  `URL_ATTRIBUTES` only, never a
   * `#hash`, an absolute URL (`https:`, `mailto:`), a root path (`/x`) or an empty one.
   * - a pure rewrite of any element
   */
  static rebase(element: Element, change: (url: string) => string): void {
    for (const node of [element, ...element.querySelectorAll("*")])
      for (const name of URL_ATTRIBUTES) {
        const value = node.getAttribute(name)
        if (value === null || !isRelative(value)) continue
        node.setAttribute(name, change(value))
      }
  }

  /**
   * A page-relative URL as the part sees it (`parts/` is one folder down):  `../x`;  `parts/y` -> `y`.
   * - pure, and passed on as a callback (`rebase()`)
   */
  static toPart = (url: string): string =>
    url.startsWith(`${PARTS_DIR}/`) ? url.slice(PARTS_DIR.length + 1) : `../${url}`

  /** A part-relative URL as the page sees it:  the inverse of `toPart()`. */
  static toPage = (url: string): string => (url.startsWith("../") ? url.slice(3) : `${PARTS_DIR}/${url}`)

  ////////////////
  // ## Files
  ////////////////

  /** The file of part `id` of the skeleton at `file`:  `<folder>/parts/<id>.html`. */
  static partFile(file: string, id: string): string {
    return join(dirname(file), PARTS_DIR, `${id}${PART_EXT}`)
  }

  /** The part files of the skeleton at `file`, as a reader:  `id` -> its text, or `undefined`. */
  static reader(file: string): PartReader {
    return (id) => {
      const path = PlanParts.partFile(file, id)
      return existsSync(path) ? readFileSync(path, "utf8") : undefined
    }
  }

  /**
   * `html` formatted as `vp fmt` would format the file at `file` (its extension picks the parser), in this
   * process:  `$/assembler`'s `formatHTML()`.  Throws on a parse error.
   */
  static formatHTML(file: string, html: string): Promise<string> {
    return AS.formatHTML(file, html)
  }

  /**
   * Write each `[file, text]` whose file doesn't already hold `text`, in order, each ATOMICALLY (a temp file beside
   * it, then a rename:  a reader, or the page server's watcher, never sees half a file);  returns the files written.
   * - the temp name ends `.tmp`:  the page server's watcher never reports it (`LiveReload` `IGNORED`)
   * - makes missing folders (`parts/`)
   */
  static writeChanged(outputs: [file: string, text: string][]): string[] {
    const written: string[] = []
    for (const [file, text] of outputs) {
      if (existsSync(file) && readFileSync(file, "utf8") === text) continue
      mkdirSync(dirname(file), { recursive: true })
      const temp = `${file}.${process.pid}.tmp`
      try {
        writeFileSync(temp, text)
        renameSync(temp, file)
      } finally {
        rmSync(temp, { force: true })
      }
      written.push(file)
    }
    return written
  }
}

/** Part `id`'s text, `undefined` when there's no such part. */
export type PartReader = (id: string) => string | undefined

/** The parts folder, beside the skeleton:  `epics/<name>/parts/`. */
export const PARTS_DIR = "parts"

/** A part file's extension:  a part is told from a page by its folder (see the class's banner). */
export const PART_EXT = ".html"

/** A part's `source`, as a skeleton writes it:  `parts/<id>.html`, `id` a section's or item's. */
export const PART_SOURCE = /^parts\/([\w-]+)\.html$/

/** A file name in `parts/` that's a part:  `[, id]`. */
export const PART_FILE = /^([\w-]+)\.html$/

/** The comment a part file starts with (`EpicParts` writes it):  stripped when assembling. */
export const PART_COMMENT = /^\s*plan-doc part\b/

/** URL attributes `SourceMarkup` rewrites against a body's `source` (`URL_ATTRIBUTES` in `$/ui` elements). */
const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"]

/** Is `url` relative to the document it's in (not empty, a hash, absolute, or from the root)? */
function isRelative(url: string): boolean {
  return url !== "" && !url.startsWith("#") && !url.startsWith("/") && !/^[a-z][a-z0-9+.-]*:/i.test(url)
}
