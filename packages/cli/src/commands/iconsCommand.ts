import chalk from "chalk"

import { SRV } from "$/server"
import { CLI } from "$/cli"

/** Most icons listed as text:  the rest are counted.  `--json` and `--open` show them all. */
const MAX_LISTED = 60

/**
 * `spell icons [query]`:  find `@spell-app/ui` icons by name, alias or keyword -- see `iconSearch.ts`.
 * - A line each:  its name, its pack, and what else it's called.
 * - `--pack <id>`:  only that pack, e.g. `fa7-brands`.
 * - `--json`:  the icons found, as JSON.
 * - `--open`:  show them as pictures, in a browser -- a page served locally, until `Ctrl-C`.  See `serve.ts`.
 * - Returns the exit code:  `EXIT.ERRORS` if nothing matched.
 */
export async function iconsCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.IconsOptions
): Promise<number> {
  const query = args.join(" ")
  let icons: CLI.IconInfo[]
  try {
    icons = await CLI.loadIcons(options.pack ? [options.pack] : undefined)
  } catch (error) {
    throw new CLI.CliError(error instanceof Error ? error.message : String(error))
  }
  const found = CLI.searchIcons(icons, query)

  if (options.open) return showGallery(session, found, query)
  if (options.json) {
    session.out(JSON.stringify(found, null, 2))
  } else {
    const shown = found.slice(0, MAX_LISTED)
    const width = Math.max(0, ...shown.map((icon) => icon.name.length))
    for (const icon of shown) {
      const also = icon.aliases.length ? chalk.dim(`  also ${icon.aliases.join(", ")}`) : ""
      session.out(`${icon.name.padEnd(width)}  ${chalk.dim(icon.pack)}${also}`)
    }
    if (found.length > MAX_LISTED)
      session.err(chalk.dim(`...and ${found.length - MAX_LISTED} more -- --open shows all`))
  }
  if (found.length) return CLI.EXIT.OK
  session.err(`No icons match '${query}'`)
  return CLI.EXIT.ERRORS
}

/** Serve a gallery of `icons` and open it in a browser, until `Ctrl-C`.  Returns the exit code. */
async function showGallery(session: CLI.CliSession, icons: CLI.IconInfo[], query: string): Promise<number> {
  const { url, server } = await CLI.serve((path) => {
    if (path === "/") return { text: galleryPage(icons, query), type: "text/html; charset=utf-8" }
    const svg = /^\/svg\/(\d+)\.svg$/.exec(path)
    const icon = svg && icons[Number(svg[1])]
    return icon ? { file: icon.svg } : undefined
  })
  session.out(url)
  session.err(`Showing ${icons.length} icon${icons.length === 1 ? "" : "s"} at ${url} -- Ctrl-C to stop`)
  SRV.openBrowser(url)
  await SRV.untilInterrupted(server)
  return CLI.EXIT.OK
}

/** The gallery page:  a filter box, then each icon -- its picture, name and pack -- by `/svg/<index>.svg`. */
export function galleryPage(icons: CLI.IconInfo[], query: string): string {
  const cards = icons
    .map((icon, index) => {
      const words = [icon.name, icon.pack, ...icon.aliases, ...icon.keywords].join(" ")
      const title = icon.aliases.length ? ` title="also ${escape(icon.aliases.join(", "))}"` : ""
      return (
        `<figure data-words="${escape(words.toLowerCase())}"${title}>` +
        `<img src="svg/${index}.svg" alt="" loading="lazy">` +
        `<figcaption>${escape(icon.name)}<small>${escape(icon.pack)}</small></figcaption></figure>`
      )
    })
    .join("\n")
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>spell icons${query ? ` · ${escape(query)}` : ""}</title>
<style>
  body { font: 14px system-ui, sans-serif; margin: 0; padding: 16px; background: #fff; color: #222; }
  header { position: sticky; top: 0; background: #fff; padding-bottom: 12px; }
  input { font: inherit; width: min(420px, 100%); padding: 6px 10px; }
  #count { color: #777; margin-left: 8px; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
  figure { margin: 0; padding: 12px 4px; text-align: center; border: 1px solid #eee; border-radius: 6px; cursor: copy; }
  figure:hover { border-color: #999; }
  img { width: 32px; height: 32px; }
  figcaption { margin-top: 6px; overflow-wrap: anywhere; }
  small { display: block; color: #999; }
  figure.copied { background: #e6f4ea; }
</style>
</head>
<body>
<header>
  <input id="filter" placeholder="filter, e.g. bell" value="${escape(query)}" autofocus>
  <span id="count"></span>
  <div><small>click an icon to copy its name</small></div>
</header>
<main>
${cards}
</main>
<script>
  const filter = document.getElementById("filter")
  const figures = [...document.querySelectorAll("figure")]
  function update() {
    const words = filter.value.toLowerCase().split(/[\\s_-]+/).filter(Boolean)
    let shown = 0
    for (const figure of figures) {
      const hit = words.every((word) => figure.dataset.words.includes(word))
      figure.hidden = !hit
      if (hit) shown++
    }
    document.getElementById("count").textContent = shown + " of " + figures.length
  }
  filter.addEventListener("input", update)
  for (const figure of figures) {
    figure.addEventListener("click", () => {
      navigator.clipboard?.writeText(figure.querySelector("figcaption").firstChild.textContent)
      figure.classList.add("copied")
      setTimeout(() => figure.classList.remove("copied"), 600)
    })
  }
  update()
</script>
</body>
</html>
`
}

/** `text` safe inside HTML text or a double-quoted attribute. */
function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
