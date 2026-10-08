import { spawnSync } from "child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join, relative } from "path"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import type { PackInfo, PackScaffoldReport } from "$/cli/dev/dev.types"
import { buildPack, packPrefix, readPack } from "$/cli/dev/packBuild"
import { REPO_ROOT } from "$/cli/findCheckout"

/**
 * `spell dev pack new <name> [--prefix x-]`:  make `packages/<name>/` a component pack, and wire it into checkout
 * `root`.
 * - The package:  `templates/pack/package/` (this CLI's), each `__token__` filled in (`PackTokens`).
 *   - A file already there is LEFT ALONE and listed in `skipped`, so it works on a folder that has some files.
 *   - `package.json` is MERGED:  the template's keys it lacks (`scripts`, `spellPack` ...) are added, its own kept.
 * - The checkout (`wirePack()`):  workspace, aliases, root vitest, lint / format ignores, `.gitattributes`, the
 *   merge-main generator, the commands page.
 * - Then builds the pack (`buildPack()`), unless `build: false`.
 * - Idempotent:  a second run creates nothing and changes nothing.
 * - Throws `CliError` for a bad name or prefix, a core package's name, or a prefix other than the pack's own.
 */
export async function newPack(root: string, name: string, options: NewPackOptions = {}): Promise<PackScaffoldReport> {
  if (!PACK_NAME.test(name)) {
    throw new CliError(`pack new:  '${name}' isn't a package name:  lowercase words joined by dashes, e.g. epics`)
  }
  if (CORE_PACKAGES.includes(name)) throw new CliError(`pack new:  '${name}' is one of the repo's own packages`)
  const dir = join(root, "packages", name)
  const existing = packPrefix(dir)
  const prefix = options.prefix ?? existing ?? `${name}-`
  if (!TAG_PREFIX.test(prefix) || prefix === "ui-") {
    throw new CliError(`pack new:  '${prefix}' isn't a tag prefix:  lowercase, ending in '-', never 'ui-', e.g. epic-`)
  }
  if (existing !== undefined && existing !== prefix) {
    throw new CliError(`pack new:  '${name}' is already a pack with prefix '${existing}', not '${prefix}'`)
  }
  const pack: PackInfo = { name, prefix, dir }
  const report: PackScaffoldReport = { pack: name, created: [], updated: [], skipped: [] }
  const tokens = packTokens(root, pack)
  writeTemplates(root, join(TEMPLATES, "package"), dir, tokens, report)
  mergePackageJson(
    root,
    join(dir, "package.json"),
    fillTokens(readTemplate("package/package.json.tmpl"), tokens),
    report
  )
  wirePack(root, pack, report)
  if (options.build !== false) report.built = await buildPack(root, name)
  return report
}

/**
 * `spell dev pack element <pack> <tag>`:  one element family, `packages/<pack>/components/<tag>/`, from
 * `templates/pack/element/` -- `<Name>.tsx` (the component), `<Name>.en.ts` (its vocabulary:  topics + aka, skeleton
 * text), `<Name>.css`, `<Name>.test.tsx`, `index.ts` -- every file named for its component, as Spell UI's families
 * are written (no native fallback:  only form controls have one);  then its line in `components/index.ts`.
 * - Files already there are left alone (`skipped`);  idempotent.
 * - Then builds the pack, unless `build: false`.
 * - Throws `CliError` when `pack` isn't a pack, or `tag` isn't a custom element name starting with its prefix.
 */
export async function newElement(
  root: string,
  packName: string,
  tag: string,
  options: NewElementOptions = {}
): Promise<PackScaffoldReport> {
  const pack = readPack(root, packName)
  if (!CUSTOM_TAG.test(tag) || !tag.startsWith(pack.prefix) || tag.length === pack.prefix.length) {
    throw new CliError(
      `pack element:  '${tag}' isn't a tag for pack '${packName}':  lowercase words joined by dashes, starting ` +
        `'${pack.prefix}', e.g. ${pack.prefix}card`
    )
  }
  const report: PackScaffoldReport = { pack: packName, created: [], updated: [], skipped: [] }
  const tokens = elementTokens(root, pack, tag)
  writeTemplates(root, join(TEMPLATES, "element"), join(pack.dir, "components", tag), tokens, report)
  const barrel = join(pack.dir, "components", "index.ts")
  if (!existsSync(barrel)) {
    writeFileSync(barrel, fillTokens(readTemplate("package/components/index.ts.tmpl"), tokens))
    report.created.push(relative(root, barrel))
  }
  const text = readFileSync(barrel, "utf8")
  if (text.includes(`from "./${tag}"`)) report.skipped.push(`${relative(root, barrel)} (exports ${tag} already)`)
  else {
    const exports = `${text.replace(/^export \{\}\n/m, "").replace(/\n*$/, "\n")}export * from "./${tag}"\n`
    writeFileSync(barrel, exports)
    report.updated.push(`${relative(root, barrel)} (exports ${tag})`)
  }
  if (options.build !== false) report.built = await buildPack(root, packName)
  return report
}

/** `newPack()`'s options:  `prefix` (default the package's own, else `<name>-`);  `build` (default `true`). */
export type NewPackOptions = { prefix?: string; build?: boolean }

/** `newElement()`'s options:  `build` (default `true`). */
export type NewElementOptions = { build?: boolean }

////////////////
// ## Templates
////////////////

/** This CLI's templates:  `templates/pack/package/` (a pack) and `templates/pack/element/` (one family). */
const TEMPLATES = join(REPO_ROOT, "packages", "cli", "templates", "pack")

/** A template file's suffix, dropped from the file it writes:  so no tool (tsc, lint, vitest) reads a template. */
const TEMPLATE_SUFFIX = ".tmpl"

/** Template files written another way:  `package.json` is merged (`mergePackageJson()`). */
const NOT_COPIED = ["package.json.tmpl"]

/** A pack's name:  lowercase words joined by dashes, as a folder under `packages/`. */
const PACK_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** A tag prefix:  lowercase words, each ending in a dash, e.g. `epic-`. */
const TAG_PREFIX = /^([a-z][a-z0-9]*-)+$/

/** A custom element name we write:  lowercase words joined by dashes, at least two. */
const CUSTOM_TAG = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/

/** The repo's own packages:  never a pack. */
const CORE_PACKAGES = [
  "app",
  "brand",
  "cli",
  "core",
  "docs",
  "lsp",
  "markdown",
  "parser",
  "server",
  "solid-element",
  "spell",
  "ui",
  "util",
  "vscode"
]

/**
 * What a template's `__token__`s become.
 * - pack:  `pack` (`epics`), `packCamel` (`epics`;  `my-pack` => `myPack`), `prefix` (`epic-`), `solid` (Solid's
 *   pinned version, from the root `package.json`'s `resolutions`)
 * - element:  `tag` (`epic-page`), `Class` (`EpicPage`:  the component, and every file's name), `vocab` (`epicPage`,
 *   as in `epicPageVocabulary`), `noun` (`page`:  the tag less the prefix), `nounCamel`
 */
export type PackTokens = Record<string, string>

/** The tokens of pack `pack` in checkout `root`. */
function packTokens(root: string, pack: PackInfo): PackTokens {
  return { pack: pack.name, packCamel: camelCase(pack.name), prefix: pack.prefix, solid: solidVersion(root) }
}

/** The tokens of element `tag` in pack `pack`. */
function elementTokens(root: string, pack: PackInfo, tag: string): PackTokens {
  const noun = tag.slice(pack.prefix.length)
  return {
    ...packTokens(root, pack),
    tag,
    Class: pascalCase(tag),
    vocab: camelCase(tag.replace(/^ui-/, "")),
    noun,
    nounCamel: camelCase(noun)
  }
}

/** `text` with each `__token__` of `tokens` filled in;  any other `__word__` stays. */
function fillTokens(text: string, tokens: PackTokens): string {
  const names = Object.keys(tokens).sort((a, b) => b.length - a.length)
  return text.replace(new RegExp(`__(${names.join("|")})__`, "g"), (_, name: string) => tokens[name]!)
}

/**
 * Write every template under `from` into `to`, `.tmpl` dropped and tokens filled in (in paths too;  `gitignore`
 * becomes `.gitignore`), skipping files already there.
 */
function writeTemplates(root: string, from: string, to: string, tokens: PackTokens, report: PackScaffoldReport) {
  for (const template of templateFiles(from)) {
    const path = relative(from, template).slice(0, -TEMPLATE_SUFFIX.length)
    const target = join(to, fillTokens(path, tokens).replace(/(^|\/)gitignore$/, "$1.gitignore"))
    if (existsSync(target)) {
      report.skipped.push(relative(root, target))
      continue
    }
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, fillTokens(readFileSync(template, "utf8"), tokens))
    report.created.push(relative(root, target))
  }
}

/** Every template file under `dir`, recursively, sorted;  minus `NOT_COPIED`. */
function templateFiles(dir: string): string[] {
  const files: string[] = []
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) files.push(...templateFiles(path))
    else if (name.endsWith(TEMPLATE_SUFFIX) && !NOT_COPIED.includes(name)) files.push(path)
  }
  return files
}

/** Template `path`'s text, relative to `templates/pack/`. */
function readTemplate(path: string): string {
  return readFileSync(join(TEMPLATES, path), "utf8")
}

/**
 * Write `file` from the `template` JSON;  when it's there already, add only the keys it lacks -- top-level, and
 * inside `scripts`, `devDependencies` and `spellPack` -- keeping its own values.
 */
function mergePackageJson(root: string, file: string, template: string, report: PackScaffoldReport) {
  const wanted = JSON.parse(template) as Record<string, unknown>
  const path = relative(root, file)
  if (!existsSync(file)) {
    writeFileSync(file, `${JSON.stringify(wanted, null, 2)}\n`)
    report.created.push(path)
    return
  }
  const json = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>
  const added: string[] = []
  for (const [key, value] of Object.entries(wanted)) {
    if (!(key in json)) {
      json[key] = value
      added.push(key)
    } else if (MERGED_KEYS.includes(key) && isObject(value) && isObject(json[key])) {
      const own = json[key] as Record<string, unknown>
      for (const [inner, innerValue] of Object.entries(value)) {
        if (inner in own) continue
        own[inner] = innerValue
        added.push(`${key}.${inner}`)
      }
    }
  }
  if (!added.length) return void report.skipped.push(path)
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
  report.updated.push(`${path} (${added.join(", ")})`)
}

/** `package.json` keys whose own keys `mergePackageJson()` adds one by one. */
const MERGED_KEYS = ["scripts", "devDependencies", "spellPack"]

/** Solid's version, pinned in checkout `root`'s `package.json` `resolutions`. */
function solidVersion(root: string): string {
  const file = join(root, "package.json")
  const json = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as RootPackageJson) : {}
  return json.resolutions?.["solid-js"] ?? "*"
}

////////////////
// ## Wiring a pack into the checkout
////////////////

/**
 * Wire pack `pack` into checkout `root`, each step only when it isn't there yet (`report.updated`, else `skipped`):
 * - `package.json`:  a workspace, and `pack/` in `pageServer.watch` (pages reload when it's rebuilt)
 * - `tsconfig.base.json`:  `$/<name>`, `$/<name>/*`, `$/<name>/components`, `$/<name>/components/*`
 * - `vitest.config.ts`:  the pack's `node` + `browser` projects (`SPECIAL`)
 * - `vite.lint.ts`:  `pack/` out of lint and format
 * - `.gitattributes`:  `pack/**` generated, `merge=binary -diff`
 * - `packages/cli/src/dev/mergeMain.ts`:  a `GENERATORS` entry, `yarn pack:build`
 * - `guides/dev/commands/commands.json` (shared):  the pack's yarn scripts in the commands page's rows
 * - A file that isn't there is skipped, said so.  Text edits keep the files' own layout;  JSON is rewritten.
 */
export function wirePack(root: string, pack: PackInfo, report: PackScaffoldReport) {
  for (const step of wiringSteps(pack)) {
    const file = join(root, step.file)
    if (!existsSync(file)) {
      report.skipped.push(`${step.file} (not found:  ${step.what})`)
      continue
    }
    const text = readFileSync(file, "utf8")
    const next = step.edit(text)
    if (next === undefined || next === text) {
      report.skipped.push(`${step.file} (${step.what}:  there already)`)
      continue
    }
    writeFileSync(file, next)
    step.after?.(file)
    report.updated.push(`${step.file} (${step.what})`)
  }
}

/** One edit `wirePack()` makes:  `edit` returns the new text, or `undefined` when it's there already. */
type WiringStep = {
  file: string
  what: string
  edit: (text: string) => string | undefined
  after?: (file: string) => void
}

/** Every edit wiring `pack` in takes. */
function wiringSteps(pack: PackInfo): WiringStep[] {
  const { name } = pack
  const projects = `${camelCase(name)}Projects`
  const key = /^[a-z]\w*$/.test(name) ? name : JSON.stringify(name)
  return [
    {
      file: "package.json",
      what: `workspace packages/${name}, pageServer.watch`,
      edit: (text) => {
        const json = JSON.parse(text) as RootPackageJson
        const added =
          addOnce(json.workspaces, `packages/${name}`) + addOnce(json.pageServer?.watch, `packages/${name}/pack`)
        return added ? `${JSON.stringify(json, null, 2)}\n` : undefined
      }
    },
    {
      file: "tsconfig.base.json",
      what: `$/${name} aliases`,
      edit: (text) =>
        text.includes(`"$/${name}"`)
          ? undefined
          : addToList(
              text,
              ['"paths": {'],
              [
                `// ## \`${name}\`:  a component pack (\`spell dev pack\`);  its elements live in \`packages/${name}/components/\`,`,
                `// outside \`src/\`, so \`$/${name}/components\` is longer than \`$/${name}/*\` and wins`,
                `"$/${name}": ["./packages/${name}/src/index.ts"],`,
                `"$/${name}/*": ["./packages/${name}/src/*"],`,
                `"$/${name}/components": ["./packages/${name}/components/index.ts"],`,
                `"$/${name}/components/*": ["./packages/${name}/components/*"]`
              ],
              { blank: true }
            )
    },
    {
      file: "vitest.config.ts",
      what: `${name}:node + ${name}:browser projects`,
      edit: (text) => {
        if (text.includes(`./packages/${name}/vitest.config.ts`)) return undefined
        const imported = addImport(text, name, `import { ${projects} } from "./packages/${name}/vitest.config.ts"`)
        const listed = addToList(
          imported,
          ["const SPECIAL", "= {"],
          [`${key}: ${projects}({ prefix: "${name}:", root: resolve(PACKAGES_DIR, "${name}") })`]
        )
        const bullet = ` * - \`${name}\`:  a component pack (\`spell dev pack\`):  \`node\` (\`src/\`) and \`browser\` (\`components/\`).`
        return listed.replace("\n */\nconst SPECIAL", `\n${bullet}\n */\nconst SPECIAL`)
      }
    },
    {
      file: "vite.lint.ts",
      what: `packages/${name}/pack ignored`,
      edit: (text) => {
        if (text.includes(`"packages/${name}/pack"`)) return undefined
        const linted = addToList(
          text,
          ["export const rootLintIgnore = ["],
          [`// \`${name}\`'s component pack:  generated (\`spell dev pack build ${name}\`)`, `"packages/${name}/pack"`]
        )
        return addToList(linted, ["export const fmtConfig = {", "ignorePatterns: ["], [`"**/packages/${name}/pack/**"`])
      }
    },
    {
      file: ".gitattributes",
      what: `packages/${name}/pack/** generated`,
      edit: (text) => {
        if (text.includes(`packages/${name}/pack/`)) return undefined
        const column = /^\S+\s+(?=linguist-generated)/m.exec(text)?.[0].length ?? 0
        const line = `${`packages/${name}/pack/**`.padEnd(column - 1)} linguist-generated merge=binary -diff`
        return `${text.replace(/\n*$/, "\n")}\n# ${name}:  its component pack (\`spell dev pack build ${name}\`)\n${line}\n`
      }
    },
    {
      file: "packages/cli/src/dev/mergeMain.ts",
      what: `GENERATORS:  ${name} pack`,
      edit: (text) =>
        text.includes(`"packages/${name}/pack/**"`)
          ? undefined
          : addToList(text, ["export const GENERATORS: Generator[] = ["], [generatorLine(text, name)])
    },
    {
      file: "guides/dev/commands/commands.json",
      what: `${name}'s yarn scripts`,
      edit: (text) => commandsWithPack(text, name),
      after: formatJson
    }
  ]
}

/** `value` pushed onto `list` unless it's there (or there's no list):  1 when it was added, else 0. */
function addOnce(list: string[] | undefined, value: string): number {
  if (!list || list.includes(value)) return 0
  list.push(value)
  return 1
}

/**
 * `GENERATORS`' line for pack `name`, its columns lined up with the table's first one-line entry (`// oxfmt-ignore`).
 */
function generatorLine(text: string, name: string): string {
  const sample = /^ *(\{ name: .*?)$/m.exec(text.slice(text.indexOf("export const GENERATORS")))?.[1] ?? ""
  const columns = ["outputs:", "cwd:", "run:"].map((field) => sample.indexOf(field))
  const fields = [
    `{ name: ${JSON.stringify(`${name} pack`)},`,
    `outputs: [${JSON.stringify(`packages/${name}/pack/**`)}],`,
    `cwd: ${JSON.stringify(`packages/${name}`)},`,
    `run: ["yarn", "pack:build"] }`
  ]
  let line = ""
  fields.forEach((field, index) => {
    const column = index ? columns[index - 1]! : 0
    line = index ? `${line.padEnd(Math.max(column, line.length + 1))}${field}` : field
  })
  return line
}

/**
 * The commands page's JSON with pack `name`'s yarn scripts in its rows, or `undefined` when they're there:
 * - `review`, `ts`, `lint`, `lint:fix`, `format`, `test`:  beside `brand`'s, in every row naming it
 * - `pack:build`, `pack:check`:  in the rows `pack-build` / `pack-check`
 */
function commandsWithPack(text: string, name: string): string | undefined {
  const data = JSON.parse(text) as CommandsJson
  let added = 0
  for (const family of data.families ?? []) {
    for (const row of family.rows ?? []) {
      const yarn = row.yarn
      if (!yarn?.names) continue
      const names = [yarn.names].flat()
      for (const script of CHECK_SCRIPTS) {
        const anchor = names.indexOf(`brand ${script}`)
        if (anchor < 0 || names.includes(`${name} ${script}`)) continue
        names.splice(anchor + 1, 0, `${name} ${script}`)
        added++
      }
      const own = row.id ? PACK_ROWS[row.id] : undefined
      if (own && !names.includes(`${name} ${own}`)) {
        names.push(`${name} ${own}`)
        added++
      }
      yarn.names = names
    }
  }
  return added ? `${JSON.stringify(data, null, 2)}\n` : undefined
}

/** A pack's check scripts, as every package has them:  listed on the commands page beside `brand`'s. */
const CHECK_SCRIPTS = ["review", "ts", "lint", "lint:fix", "format", "test"]

/** The commands page's own pack rows, by `id`:  the pack script each lists. */
const PACK_ROWS: Record<string, string> = { "pack-build": "pack:build", "pack-check": "pack:check" }

/**
 * Format the JSON `file` as the commands page's is:  oxfmt's defaults (no config:  run from the temp folder).
 * - NEVER throws:  without oxfmt the file stays as `JSON.stringify()` wrote it.
 */
function formatJson(file: string) {
  for (let dir = REPO_ROOT; ; dir = dirname(dir)) {
    const oxfmt = join(dir, "node_modules", "oxfmt", "bin", "oxfmt")
    if (existsSync(oxfmt)) return void spawnSync(oxfmt, [file], { cwd: tmpdir(), stdio: "ignore" })
    if (dirname(dir) === dir) return
  }
}

////////////////
// ## Editing lists in source text
////////////////

/**
 * `text` with `lines` added at the END of a list (array or object literal, in TS, JSON or JSONC):  the one each of
 * `openers` leads to in turn, the last ending with its `[` / `{`.
 * - A comma goes after the list's last item;  `lines` are indented as that item is, after a blank line when `blank`
 * - Throws `CliError` when an opener isn't found.
 */
export function addToList(text: string, openers: string[], lines: string[], { blank = false } = {}): string {
  let at = 0
  for (const opener of openers) {
    const found = text.indexOf(opener, at)
    if (found < 0) throw new CliError(`pack new:  can't find \`${opener}\` to add to`, EXIT.ERRORS)
    at = found + opener.length
  }
  const open = at - 1
  const close = closingBracket(text, open)
  let end = close - 1
  while (end > open && /\s/.test(text[end]!)) end--
  const empty = end === open
  const indent = empty
    ? `${/^[ \t]*/.exec(text.slice(text.lastIndexOf("\n", close) + 1))![0]}  `
    : /^[ \t]*/.exec(text.slice(text.lastIndexOf("\n", end) + 1))![0]
  const comma = empty || text[end] === "," ? "" : ","
  const body = lines.map((line) => (line ? indent + line : "")).join("\n")
  return `${text.slice(0, end + 1)}${comma}\n${blank && !empty ? "\n" : ""}${body}${text.slice(end + 1)}`
}

/** Where the bracket at `open` closes, skipping strings and comments.  Throws `CliError` when it doesn't. */
function closingBracket(text: string, open: number): number {
  let depth = 0
  for (let index = open; index < text.length; index++) {
    const char = text[index]!
    if (char === "/" && text[index + 1] === "/") index = endOf(text.indexOf("\n", index), text)
    else if (char === "/" && text[index + 1] === "*") index = endOf(text.indexOf("*/", index + 2), text) + 1
    else if (char === '"' || char === "'" || char === "`") index = stringEnd(text, index)
    else if ("[{(".includes(char)) depth++
    else if ("]})".includes(char) && --depth === 0) return index
  }
  throw new CliError("pack new:  a list that never closes", EXIT.ERRORS)
}

/** `found`, an `indexOf()`, or the end of `text` when it found nothing. */
function endOf(found: number, text: string): number {
  return found < 0 ? text.length : found
}

/** Where the string starting at `start` (its quote) ends. */
function stringEnd(text: string, start: number): number {
  const quote = text[start]
  for (let index = start + 1; index < text.length; index++) {
    if (text[index] === "\\") index++
    else if (text[index] === quote) return index
  }
  return text.length
}

/**
 * `text` with `line`, an `import { xProjects } from "./packages/<name>/vitest.config.ts"`, among the root vitest
 * config's other package imports, in folder order;  after the last import when there are none.
 */
function addImport(text: string, name: string, line: string): string {
  const imports = [...text.matchAll(/^import \{ \w+ \} from "\.\/packages\/([\w-]+)\/vitest\.config\.ts"\n/gm)]
  const after = imports.find((match) => match[1]! > name)
  if (after) return `${text.slice(0, after.index)}${line}\n${text.slice(after.index)}`
  const last = imports.at(-1) ?? [...text.matchAll(/^import .*\n/gm)].at(-1)
  const at = last ? last.index + last[0].length : 0
  return `${text.slice(0, at)}${line}\n${text.slice(at)}`
}

////////////////
// ## Names
////////////////

/** `kebab-case` => `camelCase`:  `my-pack` => `myPack`. */
function camelCase(text: string): string {
  return text.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase())
}

/** A tag => its class name:  `epic-page` => `EpicPage`, `ui-brand-blob` => `UIBrandBlob`. */
function pascalCase(tag: string): string {
  return tag
    .split("-")
    .map((word) => (word === "ui" ? "UI" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("")
}

/** `value` is a plain object. */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** The parts of the root `package.json` read here. */
type RootPackageJson = {
  workspaces?: string[]
  pageServer?: { watch?: string[] }
  resolutions?: Record<string, string>
}

/** The parts of the commands page's JSON edited here;  its full shape:  `packages/docs/tools/_assets/commands.js`. */
type CommandsJson = { families?: { rows?: { id?: string; yarn?: { names?: string | string[] } }[] }[] }
