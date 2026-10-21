import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { readJSON5File } from "spell-kit/util/node/json5"
import { SiteDataBuilder } from "@spell-app/ui/tools/SiteDataBuilder"
import {
  APP_COMPONENTS,
  APP_UI_DATA,
  APP_UI_FOLDER,
  type AppUIData,
  type AppUIFamily,
  type AppUIFamilySeed,
  type AppUIPagesFile,
  type AppUITag,
  type AppUIUse
} from "./tools.types.ts"
import { ComponentSource } from "./ComponentSource.ts"

/****************
 * ### `AppUIDataBuilder`
 * Builds the App UI docs set's data (epic `epic-workflow`, P11):
 * - `docs/__data/components.json5`:  the side column's list, and each page's API tables
 * - its search file, `search.json5` (`searchText()`)
 * - Run by `yarn site:data` (`scripts/site-data.ts`).
 *   `AppUIDataBuilder.test.ts` fails while the file is stale.
 * - The file is Spell UI's `SiteDataFile`, so the set's pages draw it with Spell UI's docs elements:
 *   `<ui-docs-nav>` lists it, `<ui-docs-api>` draws a page's tables.
 * - Three kinds of entry, one page each, as `__data/pages.json5` (hand-kept, never written) lists them:
 *   - the web components, `<spell-app>`, `<spell-editor>`, `<spell-code>` and `<spell-markdown>`:  from their
 *     vocabularies, by Spell UI's own builder
 *     (`SiteDataBuilder`), as Epic UI's elements and the brand elements are
 *   - the drawable thing's element (`spell-element`):  its vocabulary too, read from `src/`
 *   - a Solid component FILE (`src/solid/SplitPanel.tsx`):  its exported components with a banner, their props
 *     and where the app draws them, read from the source (`ComponentSource`)
 * - The groups (`pages.json5`'s `groups`) are the data's topics:  the side column's Topics view.
 *   Its own links (`nav`:  the set's home) are `pages.json5`'s too.
 * - Deterministic:  sorted, no dates, so a rebuild with nothing changed writes the same bytes.
 * - Node only.
 ****************/
export class AppUIDataBuilder {
  /** `packages/app/`, absolute. */
  readonly root: string

  /** Files read so far, by path from `root`. */
  private readonly sources = new Map<string, ComponentSource>()

  constructor({ root = APP_ROOT }: { root?: string } = {}) {
    this.root = root
  }

  /** The set's data folder, `docs/__data/`. */
  get dataFolder(): string {
    return path.join(this.root, APP_UI_FOLDER, APP_UI_DATA)
  }

  /** `docs/__data/components.json5`. */
  get dataFile(): string {
    return path.join(this.dataFolder, "components.json5")
  }

  /** `docs/__data/pages.json5`. */
  get pagesFile(): string {
    return path.join(this.dataFolder, "pages.json5")
  }

  /** `docs/__data/search.json5`:  every page's sections, for the side column's search. */
  get searchFile(): string {
    return path.join(this.dataFolder, "search.json5")
  }

  /**
   * The text of `search.json5` (Spell UI's `SiteSearchFile`):  every page's title and sections, read from the pages'
   * markup by Spell UI's own builder, as its site's search file is.
   */
  searchText(): string {
    const text = new SiteDataBuilder({ data: this.dataFolder, pages: path.join(this.root, APP_UI_FOLDER) }).searchText()
    return text.replace(SEARCH_COMMENT, `"$comment": ${JSON.stringify(SEARCH_NOTE)},`)
  }

  /** The hand-kept facts. */
  get pages(): AppUIPagesFile {
    return readJSON5File<AppUIPagesFile>(this.pagesFile)
  }

  /**
   * Build the data (nothing is written).
   * - Throws a `TypeError` when `pages.json5` and the source disagree:
   *   a family in an unknown group, a vocabulary or file it names that isn't there, a component with no page.
   */
  async build(): Promise<AppUIData> {
    const { nav, groups, families: seeds } = this.pages
    // Spell UI's builder over each vocabulary folder:  their tags;  the first's foundation tokens and themes
    const vocabularyData: AppUIData[] = []
    for (const folder of VOCABULARY_FOLDERS) vocabularyData.push(await this.spellUIData(folder))
    const vocabularyTags = new Map(vocabularyData.flatMap((data) => data.components.map((tag) => [tag.tag, tag])))
    const uses = this.allUses()
    const components: AppUITag[] = []
    const families: Record<string, AppUIFamily> = {}

    for (const [id, seed] of Object.entries(seeds)) {
      if (!groups.some((group) => group.id === seed.group)) {
        throw new TypeError(`AppUIDataBuilder.build():  ${id}'s group "${seed.group}" isn't in pages.json5's groups`)
      }
      const tags = seed.file ? this.componentTags(id, seed, uses) : [this.vocabularyTag(id, seed, vocabularyTags)]
      const mainTag = seed.mainTag ?? (tags.find((tag) => tag.tag === id) ?? tags[0]!).tag
      const href = `${id}.html`
      for (const tag of tags) {
        const main = tag.tag === mainTag
        components.push({ ...tag, folder: id, mainTag, main, page: main, href: main ? href : `${href}#${tag.tag}` })
      }
      families[id] = {
        folder: id,
        mainTag,
        title: seed.title,
        summary: seed.summary,
        status: seed.status,
        docs: false,
        tags: [mainTag, ...tags.map((tag) => tag.tag).filter((tag) => tag !== mainTag)],
        tokens: []
      }
    }

    const spellUI = vocabularyData[0]!
    return {
      $comment:
        "GENERATED by `yarn site:data` (app/, scripts/site-data.ts, tools/AppUIDataBuilder.ts) -- do not " +
        "edit.  The App UI docs set's data, in Spell UI's shape (`SiteDataFile`);  hand-kept facts:  pages.json5.",
      version: spellUI.version,
      topics: groups.map(({ id, title }) => ({ id, title })),
      components: components.sort((a, b) => a.name.localeCompare(b.name) || a.tag.localeCompare(b.tag)),
      docs: [],
      families,
      foundation: spellUI.foundation,
      themes: spellUI.themes,
      nav
    }
  }

  ////////////////
  // ## Vocabularies
  ////////////////

  /** The tag `id` names, from its vocabulary, in `seed`'s group;  throws when there's none. */
  private vocabularyTag(id: string, seed: AppUIFamilySeed, tags: Map<string, AppUITag>): AppUITag {
    const tag = tags.get(id)
    if (!tag) {
      throw new TypeError(
        `AppUIDataBuilder.build():  pages.json5 names ${id}, but no vocabulary has that tag, and it names no file`
      )
    }
    return { ...tag, name: seed.title, topics: [seed.group] }
  }

  /**
   * Spell UI's builder over `folder` (from `root`):  its tags, with its version, foundation tokens and themes.
   * - Its page seeds are ours (`pages.json5`'s families);  it never writes.
   */
  private async spellUIData(folder: string): Promise<AppUIData> {
    const builder = new SiteDataBuilder({
      components: path.join(this.root, folder),
      docs: false,
      data: this.dataFolder,
      pages: path.join(this.root, APP_UI_FOLDER)
    })
    return (await builder.build()).data
  }

  ////////////////
  // ## Solid components
  ////////////////

  /** The documented components of `seed.file`, each in `seed`'s group, with where they're drawn. */
  private componentTags(id: string, seed: AppUIFamilySeed, uses: Map<string, AppUIUse[]>): AppUITag[] {
    const file = seed.file!
    if (!existsSync(path.join(this.root, file))) {
      throw new TypeError(`AppUIDataBuilder.build():  pages.json5's ${id} names ${file}, which isn't there`)
    }
    const found = this.sourceFor(file).components
    if (!found.length) {
      throw new TypeError(`AppUIDataBuilder.build():  ${file} has no exported component with a banner, for ${id}`)
    }
    return found.map((component) => ({
      tag: component.name,
      name: component.name,
      folder: id,
      mainTag: id,
      main: false,
      page: false,
      topics: [seed.group],
      aka: [],
      ...(component.description && { description: component.description }),
      noun: component.name,
      attributes: [],
      slots: [],
      events: [],
      parts: [],
      states: [],
      texts: [],
      ...(component.props.length && { props: component.props }),
      ...(uses.get(component.name)?.length && { usedIn: uses.get(component.name) })
    }))
  }

  /**
   * Where each component is drawn:  tag => the declarations drawing it, A-Z, from every `.tsx` file of the app
   * (`src/`, `components/`), tests left out.
   * - A component drawing itself (a tree's row) isn't listed.
   */
  private allUses(): Map<string, AppUIUse[]> {
    const uses = new Map<string, AppUIUse[]>()
    for (const file of this.appFiles()) {
      for (const { tag, by } of this.sourceFor(file).uses) {
        if (tag === by) continue
        const list = uses.get(tag) ?? []
        const repoFile = path.posix.join(REPO_PACKAGE, file)
        if (!list.some((use) => use.name === by && use.file === repoFile)) list.push({ name: by, file: repoFile })
        uses.set(tag, list)
      }
    }
    for (const list of uses.values()) list.sort(byNameThenFile)
    return uses
  }

  /** Every `.tsx` file in `src/` and `components/`, but tests:  paths from `root`, sorted. */
  private appFiles(): string[] {
    const files: string[] = []
    const walk = (folder: string): void => {
      for (const entry of readdirSync(path.join(this.root, folder), { withFileTypes: true })) {
        const file = path.posix.join(folder, entry.name)
        if (entry.isDirectory()) walk(file)
        else if (entry.name.endsWith(".tsx") && !TEST_FILE.test(entry.name)) files.push(file)
      }
    }
    for (const folder of SOURCE_FOLDERS) walk(folder)
    return files.sort()
  }

  /** `file` (from `root`), read once. */
  private sourceFor(file: string): ComponentSource {
    let source = this.sources.get(file)
    if (!source) {
      source = new ComponentSource({
        file,
        text: readFileSync(path.join(this.root, file), "utf8"),
        findTypeSource: this.findTypeSource,
        sourceFor: (other) => this.sourceFor(other)
      })
      this.sources.set(file, source)
    }
    return source
  }

  /**
   * The app file `specifier`, imported into `from`, stands for:  `./peer`, `$/app/...` or `$/app/components/...`;
   * `undefined` for any other package's, or a file that isn't there.
   * - A folder is its barrel, `index.ts`.
   */
  private readonly findTypeSource = (from: string, specifier: string): string | undefined => {
    let base: string | undefined
    if (specifier.startsWith("./")) base = path.posix.join(path.posix.dirname(from), specifier)
    else if (specifier.startsWith(COMPONENTS_ALIAS))
      base = path.posix.join(APP_COMPONENTS, specifier.slice(COMPONENTS_ALIAS.length))
    else if (specifier.startsWith(APP_ALIAS)) base = path.posix.join("src", specifier.slice(APP_ALIAS.length))
    if (!base) return undefined
    return SOURCE_EXTENSIONS.map((extension) => base + extension).find((file) => existsSync(path.join(this.root, file)))
  }
}

/** `packages/app/`. */
const APP_ROOT = path.resolve(import.meta.dirname, "..")

/** `packages/app/`, from the repo root:  how the used-in table names a file. */
const REPO_PACKAGE = "app"

/** Where the vocabularies are, from `packages/app/`:  the web components, and the runner's drawable-thing element. */
const VOCABULARY_FOLDERS = [APP_COMPONENTS, "src"]

/** Where the components that draw others are, from `packages/app/`. */
const SOURCE_FOLDERS = ["src", APP_COMPONENTS]

/** A test file's name. */
const TEST_FILE = /\.test\.tsx$/

/** The app's aliases, as `tsconfig.base.json` has them:  `$/app/components/*` is longer, so it's tried first. */
const COMPONENTS_ALIAS = "$/app/components/"
const APP_ALIAS = "$/app/"

/** What an import's specifier may leave off. */
const SOURCE_EXTENSIONS = [".ts", ".tsx", "/index.ts"]

/** The search file's `$comment` line, as Spell UI's builder writes it (naming Spell UI's script). */
const SEARCH_COMMENT = /"\$comment": ".*",/

/** Ours. */
const SEARCH_NOTE =
  "GENERATED by `yarn site:data` (app/, scripts/site-data.ts, tools/AppUIDataBuilder.ts) from the set's " +
  "pages, by Spell UI's SiteSearchBuilder -- do not edit.  Shape:  `SiteSearchFile` in @spell-app/ui's docs types."

/** A-Z by name, then file. */
function byNameThenFile(a: AppUIUse, b: AppUIUse): number {
  return a.name.localeCompare(b.name) || a.file.localeCompare(b.file)
}
