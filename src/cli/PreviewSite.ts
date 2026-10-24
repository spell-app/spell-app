import { spawn } from "child_process"
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs"
import { dirname, join, resolve } from "path"

import { SRV } from "spell/server"
import environment from "spell-app/spaces/server/node/environment"
import * as projectUtils from "spell-app/spaces/server/node/projects/project-utils"
import { SP } from "spell-parser/spell"
import { CLI } from "spell-app/cli"

/**
 * The editor's STATIC build, the public preview (epic `debut` P9):  the editor as plain files, which any web host
 * serves, with no server behind it.
 * - `build()` writes it into `folder` (`app/dist-static/`):
 *   1. the editor, built by Vite in its static mode (`vp build --mode static`):  the page reads `isStaticBuild`,
 *      hides what needs a server, and answers its files from the build (`StaticFiles`, in the app)
 *   2. the projects it shows (`PREVIEW_GROUPS`:  the examples, the guides), whatever's there as it builds,
 *      compiled first (`spell compile --stale`)
 *   3. what the page server would have answered for them, as files:
 *      - each group's list:  `api/projects/list/<group>.json`;  every other group's, empty
 *      - each project's index:  `api/projects/index/<project>.json`
 *      - its files and what spell built of them:  `spaces/<project>/<file>`, as the page server's URLs have them
 *      - the projects they import too, e.g. a library
 *   4. every unknown page sent to the editor's page, for the hosts that read these:
 *      - `404.html`, a copy of `index.html` (GitHub Pages)
 *      - `_redirects`, the editor's routes to `index.html` (Netlify, Cloudflare Pages)
 * - `serve()` shows it as a host would:  the files as they are, the editor's page for every other page.
 * - Builds only:  no deploy yet (epic `debut` Q6).
 * - Node only;  a part of `spell app preview` (`previewCommand.ts`).
 */
export class PreviewSite {
  /** where the build goes */
  readonly folder: string

  constructor(folder: string = STATIC_FOLDER) {
    this.folder = folder
  }

  ////////////////
  // ## Building
  ////////////////

  /**
   * Build the editor into `folder`, then the projects it shows -- see the class.
   * - SIDE EFFECT:  `folder` is emptied first;  the projects are compiled where they're out of date.
   * - Returns what it wrote:  the projects, by group.
   * - throws `CLI.CliError` if Vite's build fails, with what it said
   */
  async build(session: CLI.CliSession): Promise<PreviewContents> {
    await this.buildEditor()
    const groups = await this.groupsToShow()
    const projectIds = Object.values(groups).flat()
    if (projectIds.length) await CLI.compileCommand(session, projectIds, { stale: true })
    for (const [group, ids] of Object.entries(groups)) await this.writeGroup(group, ids)
    for (const group of this.groupsNotShown(groups)) this.writeJSON(SP.SpellUrls.LIST + group, [])
    const written = new Set<string>()
    for (const projectId of projectIds) await this.writeProject(projectId, written)
    this.writeFallbacks()
    return { groups, imported: [...written].filter((projectId) => !projectIds.includes(projectId)) }
  }

  /** Vite's build of the editor, in its static mode, into `folder`. */
  private buildEditor(): Promise<void> {
    rmSync(this.folder, { recursive: true, force: true })
    const args = ["vp", "build", "--mode", STATIC_MODE, "--outDir", this.folder, "--emptyOutDir"]
    return new Promise((done, fail) => {
      const child = spawn("yarn", args, { cwd: APP_FOLDER, stdio: ["ignore", "pipe", "pipe"] })
      let output = ""
      for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk) => (output += String(chunk)))
      child.once("error", (error) => fail(new CLI.CliError(`couldn't run Vite:  ${error.message}`)))
      child.once("exit", (code) => {
        if (code === 0) done(this.fixStaticLinks())
        else fail(new CLI.CliError(`Vite's build failed (exit ${code}):\n${output.slice(-4000)}`))
      })
    })
  }

  /**
   * The editor page's links into the app's `static/` folder (Semantic UI's sheet, Lato), which Vite leaves as they
   * are:  copied in, and linked from the site's root, so every page of the editor finds them.
   */
  private fixStaticLinks(): void {
    for (const name of STATIC_ASSETS) {
      cpSync(join(APP_FOLDER, "static", name), join(this.folder, "static", name), { recursive: true })
    }
    const page = join(this.folder, PAGE)
    writeFileSync(page, readFileSync(page, "utf8").replaceAll(`"../static/`, `"/static/`))
  }

  /** The projects of each group in `PREVIEW_GROUPS` that's there, by group:  `[]` for one that has none yet. */
  private async groupsToShow(): Promise<Record<string, string[]>> {
    const groups: Record<string, string[]> = {}
    for (const group of PREVIEW_GROUPS) {
      groups[group] = (await projectUtils.getProjectList(group)).map(({ path }) => path)
    }
    return groups
  }

  /**
   * Every other group spell knows, e.g. `owen@spell`:  each listed empty, so the editor reads none there,
   * without a 404 in the browser's console.
   */
  private groupsNotShown(groups: Record<string, string[]>): string[] {
    return Object.keys(SP.SpellSetup.projectRoots).filter((group) => !(group in groups))
  }

  /** Group `group`'s list, as `GET /api/projects/list/<group>` answers it. */
  private async writeGroup(group: string, projectIds: string[]): Promise<void> {
    const list = projectIds.length ? await projectUtils.getProjectList(group) : []
    this.writeJSON(SP.SpellUrls.LIST + group, list)
  }

  /**
   * Project `projectId`'s index, its files and what spell built of them;  then each project it imports, once.
   * - Its index as the page server answers it, without writing its project file (`saving: "if it has one"`).
   * - Its folder's files, then its build folder's over them:  their URLs sit side by side (`/spaces/<project>/`).
   */
  private async writeProject(projectId: string, written: Set<string>): Promise<void> {
    if (written.has(projectId)) return
    written.add(projectId)
    const index = await projectUtils.getIndex(projectId, { saving: "if it has one" })
    this.writeJSON(SP.SpellUrls.INDEX + projectId, index)

    const source = SP.SpellLocation.getProjectLocation(projectId).serverPath
    const target = join(this.folder, SP.SpellUrls.SPACES, projectId)
    copyFiles(source, target)
    const built = projectUtils.buildFolderFor(source)
    if (built !== source && existsSync(built)) copyFiles(built, target)

    for (const { path } of index.imports) {
      if (SP.SpellLocation.isAddress(path)) await this.writeProject(SP.SpellUrls.split(path).projectId, written)
    }
  }

  /** `value` as JSON, where the static build reads API URL `url`:  `<url>.json` (`StaticFiles`, in the app). */
  private writeJSON(url: string, value: unknown): void {
    const file = join(this.folder, `${url}${BUILT_DATA_SUFFIX}`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
  }

  /** Every unknown page to the editor's page, for the hosts that read these files -- see the class. */
  private writeFallbacks(): void {
    copyFileSync(join(this.folder, PAGE), join(this.folder, "404.html"))
    const rules = EDITOR_ROUTES.map((route) => `${route}  /${PAGE}  200`)
    writeFileSync(join(this.folder, "_redirects"), `${rules.join("\n")}\n`)
  }

  ////////////////
  // ## Serving
  ////////////////

  /**
   * Serve `folder` as a host would, on loopback:  its files as they are;  any other page, the editor's page.
   * - A file's path (under `FILE_PREFIXES`:  `/api/`, `/spaces/` ...), not there:  a 404, as a host answers it --
   *   the editor reads a list the build has none of as empty.
   *   - The editor's own pages hold file names too (`/edit/@spell/examples/x/x.spell`):  so by where, not by a dot.
   * - `port`:  default `PREVIEW_PORT`, else any free one.
   * - Resolves its URL and server, listening.
   * - throws `CLI.CliError` if there's no build:  `spell app preview build` first
   */
  async serve({ port = PREVIEW_PORT }: { port?: number } = {}): Promise<{ url: string; server: SRV.WebServer }> {
    if (!existsSync(join(this.folder, PAGE))) {
      throw new CLI.CliError(`no static build in ${this.folder} -- \`spell app preview build\` first`)
    }
    const server = new SRV.WebServer({ mounts: [{ prefix: "/", dir: this.folder }] })
    server.fallback.get("*", async (request, reply, next) => {
      if (FILE_PREFIXES.some((prefix) => request.path.startsWith(prefix))) return next()
      await reply.type("text/html; charset=utf-8").sendFile(join(this.folder, PAGE))
    })
    const { url } = await server.listen({ port })
    return { url: `${url}/`, server }
  }
}

/** What `PreviewSite.build()` wrote:  each group's projects, and the projects they import from elsewhere. */
export type PreviewContents = {
  /** the projects of each group shown, by group */
  groups: Record<string, string[]>
  /** projects from other groups they import, e.g. a library's */
  imported: string[]
}

/** The groups the static build shows:  the examples and the guides, whatever's in them as it builds. */
export const PREVIEW_GROUPS = ["@spell/examples", "@spell/guides"]

/** The app's build folder:  Vite's root. */
const APP_FOLDER = resolve(environment.repoDir, "app")

/** Where the static build goes:  `app/dist-static/` (git-ignored). */
export const STATIC_FOLDER = join(APP_FOLDER, "dist-static")

/** Vite's mode for the static build:  the app's `STATIC_MODE` (`spell-app/app/static/staticBuild`), copied. */
const STATIC_MODE = "static"

/** End of the files written for the API's lists and indexes:  the app's `BUILT_DATA_SUFFIX` (`StaticFiles`). */
const BUILT_DATA_SUFFIX = ".json"

/** The editor's page, at the build's root. */
const PAGE = "index.html"

/** The editor's routes, for `_redirects`:  the app's `ROUTES` (`routes.tsx`). */
const EDITOR_ROUTES = ["/edit/*", "/run/*"]

/** Where the build's files are:  a path under one of these, not there, is a 404, never the editor's page. */
const FILE_PREFIXES = ["/api/", "/spaces/", "/assets/", "/static/"]

/** Folders of the app's `static/` the editor links:  its page's sheets and fonts, and Spell's icon. */
const STATIC_ASSETS = ["semantic-ui-css", "lato", "favicon"]

/** `spell app preview serve`'s port, unless told one:  beside the page server's 4747. */
export const PREVIEW_PORT = 4848

/** Copy folder `from`'s files into `to`, recursively, but no hidden ones (`.DS_Store`, `.git`). */
function copyFiles(from: string, to: string): void {
  mkdirSync(to, { recursive: true })
  for (const name of readdirSync(from)) {
    if (name.startsWith(".")) continue
    cpSync(join(from, name), join(to, name), {
      recursive: true,
      filter: (path) => !/\/\./.test(path.slice(from.length))
    })
  }
}
