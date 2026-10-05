import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { UI } from "$/ui/runtime"
import type { SearchResult } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import { SearchMatcher } from "$/ui/components/ui-search"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-search/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A search host with its rich properties. */
type Search = UIHost & { value: unknown; source: SearchResult[] | undefined; open: unknown }

/** Fruit, one with a price, one a link. */
const FRUIT: SearchResult[] = [
  { title: "Apple", description: "Crisp and sweet" },
  { title: "Apricot", description: "Soft", price: "$2.00" },
  { title: "Banana", description: "Yellow" },
  { title: "Grape", url: "#grape" },
  { title: "Pineapple", description: "Tropical" }
]

/** Food in categories. */
const FOOD: SearchResult[] = [
  { title: "Apple", category: "Fruit" },
  { title: "Asparagus", category: "Vegetables" },
  { title: "Avocado", category: "Fruit" },
  { title: "Almond" }
]

/** Render a search, set its `source`, and return its pieces. */
async function search(html: string, source?: SearchResult[]) {
  const host = await ElementFixture.render<Search>(html)
  if (source) host.source = source
  await ElementFixture.tick()
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  return {
    host,
    root,
    input: root.querySelector<HTMLInputElement>("input.prompt")!,
    results: root.querySelector<HTMLElement>(".results[popover]")!,
    status: root.querySelector<HTMLElement>("[role=status]")!,
    titles: () => [...root.querySelectorAll(".result .title")].map((title) => title.textContent),
    highlighted: () => root.querySelector(".result.active .title")?.textContent ?? undefined
  }
}

describe("<ui-search> rendering open from the start", () => {
  it.each([
    ["", FRUIT],
    ["category", FOOD]
  ])("%s results render without a STRICT_READ_UNTRACKED warning", async (attributes, source) => {
    const logs: string[] = []
    const spies = (["warn", "error", "info", "log"] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logs.push(args.map(String).join(" ")))
    )
    try {
      const { titles } = await search(`<ui-search open value="a" ${attributes}></ui-search>`, source)
      await ElementFixture.tick()
      expect(titles().length).toBeGreaterThan(0)
    } finally {
      spies.forEach((spy) => spy.mockRestore())
    }
    expect(logs.filter((line) => line.includes("STRICT_READ_UNTRACKED"))).toEqual([])
  })
})

/** Collect `detail`s of `name` events. */
function record(host: Element, name: string) {
  const details: unknown[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

/** Let `root`'s running transitions (the results fading in) finish, so axe reads final colours. */
async function transitionsDone(root: Element) {
  const shadows = [...root.querySelectorAll("*")].flatMap((element) => (element.shadowRoot ? [element.shadowRoot] : []))
  const animations = shadows.flatMap((shadow) => shadow.getAnimations())
  await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)))
}

/** A `fetch` stub answering JSON per URL;  records every call. */
function stubFetch(answer: (url: string) => unknown, status = 200) {
  const calls: { url: string; signal?: AbortSignal | null }[] = []
  const fetch = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = input.toString()
    calls.push({ url, signal: init?.signal })
    return new Response(JSON.stringify(answer(url)), {
      status,
      headers: { "Content-Type": "application/json" }
    })
  })
  vi.stubGlobal("fetch", fetch)
  return calls
}

beforeEach(async () => {
  await UI.load()
  UI.overlays.useCloseWatcher = false
})

afterEach(() => {
  UI.overlays.dispose()
  vi.unstubAllGlobals()
})

describe("SearchMatcher", () => {
  it("puts word starts first, then matches anywhere (`exact`)", () => {
    const matcher = new SearchMatcher()
    expect(matcher.search(FRUIT, "ap").map((result) => result.title)).toEqual([
      "Apple",
      "Apricot",
      "Grape",
      "Pineapple"
    ])
    expect(matcher.search(FRUIT, "SWEET").map((result) => result.title)).toEqual(["Apple"])
    expect(matcher.search(FRUIT, "  ")).toEqual([])
  })

  it("matches in order with `fuzzy`, only word starts with `prefix`", () => {
    expect(new SearchMatcher({ match: "fuzzy" }).search(FRUIT, "bnn").map((result) => result.title)).toEqual(["Banana"])
    expect(new SearchMatcher({ match: "prefix" }).search(FRUIT, "pple").map((result) => result.title)).toEqual([])
    expect(new SearchMatcher({ match: "exact" }).search(FRUIT, "pple").map((result) => result.title)).toEqual([
      "Apple",
      "Pineapple"
    ])
  })

  it("matches any word with `some`, every word across fields with `all`", () => {
    expect(new SearchMatcher({ match: "some" }).search(FRUIT, "zzz yellow").map((result) => result.title)).toEqual([
      "Banana"
    ])
    expect(new SearchMatcher({ match: "all" }).search(FRUIT, "apple sweet").map((result) => result.title)).toEqual([
      "Apple"
    ])
  })

  it("searches the fields it's given, and folds diacritics on request", () => {
    const source = [{ title: "Café", code: 42 }]
    expect(new SearchMatcher({ fields: ["code"] }).search(source, "42")).toHaveLength(1)
    expect(new SearchMatcher().search(source, "cafe")).toHaveLength(0)
    expect(new SearchMatcher({ ignoreDiacritics: true }).search(source, "cafe")).toHaveLength(1)
  })

  it("groups by category (leaving uncategorized results out, as Fomantic) and reads remote answers", () => {
    expect(SearchMatcher.categorize(FOOD).map((group) => [group.name, group.results.length])).toEqual([
      ["Fruit", 2],
      ["Vegetables", 1]
    ])
    expect(SearchMatcher.groups({ results: FRUIT }, 2)[0]!.results).toHaveLength(2)
    expect(SearchMatcher.groups(FRUIT)[0]!.results).toHaveLength(5)
    const keyed = { results: { fruit: { name: "Fruit", results: [FRUIT[0]!] }, none: { name: "None", results: [] } } }
    expect(SearchMatcher.groups(keyed).map((group) => group.name)).toEqual(["Fruit"])
    expect(SearchMatcher.groups({} as never)).toEqual([])
  })
})

describe("<ui-search> markup", () => {
  it("renders the contract:  classes, the icon input, combobox ARIA, the anchor", async () => {
    const { root, input, results, status } = await search(`<ui-search placeholder="Fruit"></ui-search>`)
    expect(root.className).toBe("ui search")
    expect(input.parentElement!.className).toBe("ui icon input")
    expect(input.getAttribute("role")).toBe("combobox")
    expect(input.getAttribute("aria-autocomplete")).toBe("list")
    expect(input.getAttribute("aria-expanded")).toBe("false")
    expect(input.getAttribute("aria-controls")).toBe(results.id)
    expect(input.getAttribute("aria-label")).toBe("Fruit")
    expect(results.getAttribute("popover")).toBe("manual")
    expect(results.hasAttribute("role")).toBe(false)
    expect(status.textContent).toBe("")
    expect(root.style.getPropertyValue("--_ui-search-anchor")).toMatch(/^--ui-search-\d+$/)
    await expect.poll(() => root.querySelector(".search.icon svg")).not.toBeNull()
  })

  it("emits Fomantic's class words", async () => {
    const { root, input } = await search(
      `<ui-search size="large" category fluid aligned="right" loading aria-label="x"></ui-search>`
    )
    expect(root.className).toBe("ui large category fluid loading right aligned search")
    expect(input.parentElement!.className).toBe("ui icon input loading fluid")
    expect(input.getAttribute("aria-busy")).toBe("true")
  })

  it("is named by the translated `label` when nothing else names it", async () => {
    const { input } = await search(`<ui-search></ui-search>`)
    expect(input.getAttribute("aria-label")).toBe("Search")
  })
})

describe("<ui-search> local", () => {
  it("shows the matches of what's typed, with ui-search and a live count", async () => {
    const { host, input, results, status, titles } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    const searches = record(host, "ui-search")
    const opens = record(host, "ui-open")
    await userEvent.type(input, "ap")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(true)
    expect(results.getAttribute("role")).toBe("listbox")
    expect(input.getAttribute("aria-expanded")).toBe("true")
    expect(host.matches(":state(open)")).toBe(true)
    expect(titles()).toEqual(["Apple", "Apricot", "Grape", "Pineapple"])
    expect(searches.map((detail) => (detail as { query: string }).query)).toEqual(["a", "ap"])
    expect(opens).toHaveLength(1)
    expect(host.value).toBe("ap")
    expect(status.textContent).toBe("4 results available.")
    const apricot = results.querySelectorAll(".result")[1]!
    expect(apricot.querySelector(".price")!.textContent).toBe("$2.00")
    expect(apricot.querySelector(".description")!.textContent).toBe("Soft")
  })

  it("waits for `min-characters`, caps at `max-results`, and marks matches", async () => {
    const { input, results, titles } = await search(
      `<ui-search min-characters="2" max-results="2" highlight-matches aria-label="Fruit"></ui-search>`,
      FRUIT
    )
    await userEvent.type(input, "a")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(false)
    await userEvent.type(input, "p")
    await ElementFixture.tick()
    expect(titles()).toEqual(["Apple", "Apricot"])
    expect(results.querySelector(".title mark")!.textContent).toBe("Ap")
  })

  it("matches with `full-text-search` and `search-fields`", async () => {
    const fuzzy = await search(`<ui-search full-text-search="fuzzy" aria-label="x"></ui-search>`, FRUIT)
    await userEvent.type(fuzzy.input, "bnn")
    await ElementFixture.tick()
    expect(fuzzy.titles()).toEqual(["Banana"])
    const titleOnly = await search(`<ui-search search-fields="title" aria-label="y"></ui-search>`, FRUIT)
    await userEvent.type(titleOnly.input, "sweet")
    await ElementFixture.tick()
    expect(titleOnly.titles()).toEqual([])
  })

  it("groups a `category` search by each result's category, as named groups", async () => {
    const { root, input } = await search(`<ui-search category aria-label="Food"></ui-search>`, FOOD)
    await userEvent.type(input, "a")
    await ElementFixture.tick()
    const groups = [...root.querySelectorAll<HTMLElement>(".category[role=group]")]
    expect(groups.map((group) => group.querySelector(".name")!.textContent)).toEqual(["Fruit", "Vegetables"])
    const name = root.querySelector(`#${CSS.escape(groups[0]!.getAttribute("aria-labelledby")!)}`)!
    expect(name.textContent).toBe("Fruit")
    expect([...groups[0]!.querySelectorAll(".result .title")].map((title) => title.textContent)).toEqual([
      "Apple",
      "Avocado"
    ])
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}")
    await ElementFixture.tick()
    expect(groups[1]!.classList.contains("active")).toBe(true)
  })

  it("says so when nothing matches, unless `show-no-results` is off", async () => {
    const { root, input, results, status } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    await userEvent.type(input, "zz")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(true)
    expect(results.hasAttribute("role")).toBe(false)
    expect(input.getAttribute("aria-expanded")).toBe("false")
    expect(root.querySelector(".empty.message .header")!.textContent).toBe("No Results")
    expect(status.textContent).toBe("Your search returned no results")
    const quiet = await search(`<ui-search show-no-results="false" aria-label="Quiet"></ui-search>`, FRUIT)
    await userEvent.type(quiet.input, "zz")
    await ElementFixture.tick()
    expect(quiet.results.matches(":popover-open")).toBe(false)
  })
})

describe("<ui-search> keyboard", () => {
  it("moves with the arrows (stopping at the ends), chooses with Enter", async () => {
    const { host, input, results, highlighted } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    const selects = record(host, "ui-select")
    const changes = record(host, "ui-change")
    await userEvent.type(input, "ap")
    await ElementFixture.tick()
    expect(highlighted()).toBeUndefined()
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Apple")
    const active = input.getAttribute("aria-activedescendant")!
    expect(host.shadowRoot!.getElementById(active)!.getAttribute("aria-selected")).toBe("true")
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Pineapple")
    await userEvent.keyboard("{ArrowUp}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Grape")
    await userEvent.keyboard("{ArrowUp}")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Apricot")
    await userEvent.keyboard("{Enter}")
    await ElementFixture.tick()
    expect(selects).toEqual([expect.objectContaining({ result: FRUIT[1] })])
    expect(changes).toEqual([expect.objectContaining({ value: "Apricot" })])
    expect(host.value).toBe("Apricot")
    expect(input.value).toBe("Apricot")
    expect(results.matches(":popover-open")).toBe(false)
    expect(host.shadowRoot!.activeElement).toBe(input)
  })

  it("Escape closes the results, then clears the text", async () => {
    const { host, input, results } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    await userEvent.type(input, "ban")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(true)
    await userEvent.keyboard("{Escape}")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(false)
    expect(input.value).toBe("ban")
    await userEvent.keyboard("{Escape}")
    await ElementFixture.tick()
    expect(input.value).toBe("")
    expect(host.value).toBe("")
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(false)
  })

  it("ArrowDown reopens closed results;  `select-first-result` highlights the first", async () => {
    const { input, results, highlighted } = await search(
      `<ui-search select-first-result aria-label="Fruit"></ui-search>`,
      FRUIT
    )
    await userEvent.type(input, "gr")
    await ElementFixture.tick()
    expect(highlighted()).toBe("Grape")
    await userEvent.keyboard("{Escape}")
    await ElementFixture.tick()
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(true)
  })

  it("keeps everything when ui-select is cancelled;  a cancelled link click doesn't navigate", async () => {
    const { host, input, results } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    host.addEventListener("ui-select", (event) => event.preventDefault())
    await userEvent.type(input, "gra")
    await ElementFixture.tick()
    const link = results.querySelector<HTMLAnchorElement>("a.result")!
    expect(link.getAttribute("href")).toBe("#grape")
    expect(link.getAttribute("tabindex")).toBe("-1")
    const click = new MouseEvent("click", { bubbles: true, cancelable: true })
    link.dispatchEvent(click)
    await ElementFixture.tick()
    expect(click.defaultPrevented).toBe(true)
    expect(host.value).toBe("gra")
    expect(results.matches(":popover-open")).toBe(true)
  })

  it("chooses with a click, and closes on an outside click", async () => {
    const { host, input, results } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    const outside = document.createElement("p")
    outside.textContent = "outside"
    host.before(outside)
    await userEvent.type(input, "ban")
    await ElementFixture.tick()
    results.querySelector<HTMLElement>(".result")!.click()
    await ElementFixture.tick()
    expect(host.value).toBe("Banana")
    await userEvent.type(input, "a")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(true)
    await userEvent.click(outside)
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(false)
  })

  it("stays hidden when ui-open is cancelled", async () => {
    const { host, input, results } = await search(`<ui-search aria-label="Fruit"></ui-search>`, FRUIT)
    host.addEventListener("ui-open", (event) => event.preventDefault())
    await userEvent.type(input, "ap")
    await ElementFixture.tick()
    expect(results.matches(":popover-open")).toBe(false)
  })

  it("reverts the text when the host re-sets the old value while typing", async () => {
    const { host, input } = await search(`<ui-search aria-label="Fruit" value="x"></ui-search>`, FRUIT)
    host.addEventListener("ui-search", () => (host.value = "x"))
    await userEvent.type(input, "y")
    await ElementFixture.tick()
    expect(host.value).toBe("x")
    expect(input.value).toBe("x")
  })
})

describe("<ui-search> remote", () => {
  it("fills the url template, shows loading, then the answer;  caches per query", async () => {
    const calls = stubFetch((url) => ({
      results: FRUIT.filter((result) =>
        result.title.toLowerCase().includes(new URL(url, location.href).searchParams.get("q")!)
      )
    }))
    const { host, root, input, titles } = await search(
      `<ui-search url="/api/fruit?q={query}" search-delay="0" aria-label="Fruit"></ui-search>`
    )
    const answers = record(host, "ui-results")
    await userEvent.type(input, "ban")
    expect(host.matches(":state(loading)") || titles().length > 0).toBe(true)
    await expect.poll(() => titles()).toEqual(["Banana"])
    expect(root.classList.contains("loading")).toBe(false)
    expect(calls.at(-1)!.url).toBe("/api/fruit?q=ban")
    expect(answers.at(-1)).toEqual({ query: "ban", results: [FRUIT[2]] })
    const count = calls.length
    await userEvent.keyboard("{Backspace}")
    await ElementFixture.tick()
    await userEvent.type(input, "n")
    await ElementFixture.tick()
    expect(calls.length).toBe(count)
    expect(titles()).toEqual(["Banana"])
  })

  it("debounces typing and aborts a superseded query", async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    const calls: { url: string; signal?: AbortSignal | null }[] = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        const url = input.toString()
        calls.push({ url, signal: init?.signal })
        if (calls.length === 1) await gate
        return new Response(JSON.stringify([{ title: url }]), {
          headers: { "Content-Type": "application/json" }
        })
      })
    )
    const { input, titles } = await search(
      `<ui-search url="/api?q={query}" search-delay="50" aria-label="Remote"></ui-search>`
    )
    await userEvent.type(input, "abc")
    await expect.poll(() => calls.length).toBe(1)
    expect(calls[0]!.url).toBe("/api?q=abc")
    await userEvent.type(input, "d")
    await expect.poll(() => calls.length).toBe(2)
    expect(calls[0]!.signal!.aborted).toBe(true)
    release()
    await expect.poll(() => titles()).toEqual(["/api?q=abcd"])
  })

  it("shows the server error, and category answers as groups", async () => {
    stubFetch(() => ({}), 500)
    const failing = await search(`<ui-search url="/api?q={query}" search-delay="0" aria-label="Failing"></ui-search>`)
    await userEvent.type(failing.input, "x")
    await expect
      .poll(() => failing.root.querySelector(".error.message")?.textContent)
      .toBe("There was an issue querying the server.")
    vi.unstubAllGlobals()
    stubFetch(() => ({ results: { fruit: { name: "Fruit", results: [{ title: "Kiwi" }] } } }))
    const grouped = await search(
      `<ui-search category url="/api?q={query}" search-delay="0" aria-label="Grouped"></ui-search>`
    )
    await userEvent.type(grouped.input, "k")
    await expect.poll(() => grouped.root.querySelector(".category .name")?.textContent).toBe("Fruit")
    expect(grouped.titles()).toEqual(["Kiwi"])
  })
})

describe("<ui-search> forms", () => {
  it("submits its text, validates `required`, resets to the attribute", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-search name="q" value="start" aria-label="Query"></ui-search>
      <ui-search name="must" required aria-label="Must"></ui-search>
    </form>`)
    const [query, must] = form.querySelectorAll<Search>("ui-search")
    query!.source = FRUIT
    expect(new FormData(form).get("q")).toBe("start")
    expect(form.checkValidity()).toBe(false)
    expect(must!.matches(":state(invalid)")).toBe(true)
    must!.value = "ok"
    const input = query!.shadowRoot!.querySelector<HTMLInputElement>("input")!
    await userEvent.clear(input)
    await userEvent.type(input, "ban")
    await userEvent.keyboard("{ArrowDown}{Enter}")
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(true)
    expect([...new FormData(form)]).toEqual([
      ["q", "Banana"],
      ["must", "ok"]
    ])
    form.reset()
    await ElementFixture.tick()
    expect(new FormData(form).get("q")).toBe("start")
    expect(input.value).toBe("start")
  })

  it("is disabled, and out of the form, inside a disabled fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><fieldset disabled><ui-search name="q" value="x" aria-label="Q"></ui-search></fieldset></form>`
    )
    await ElementFixture.tick()
    const host = form.querySelector<Search>("ui-search")!
    expect(new FormData(form).has("q")).toBe(false)
    expect(host.shadowRoot!.querySelector("input")!.disabled).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
  })

  it("commits an edited text with ui-change when it's left", async () => {
    const page = await ElementFixture.render(`<div><ui-search aria-label="Q"></ui-search><button>next</button></div>`)
    const host = page.querySelector<Search>("ui-search")!
    const changes = record(host, "ui-change")
    await userEvent.type(host.shadowRoot!.querySelector("input")!, "hello")
    await userEvent.click(page.querySelector("button")!)
    await ElementFixture.tick()
    expect(changes).toEqual([expect.objectContaining({ value: "hello" })])
  })
})

describe("<ui-search> tokens from outside", () => {
  /** The prompt's top-left radius, which `--ui-search-prompt-radius` drives (through the input's own token). */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("input.prompt")!).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await search(`<ui-search style="--ui-search-prompt-radius: 3px"></ui-search>`)
    expect(radius(host)).toBe("3px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-search-prompt-radius: 3px"><div><ui-search></ui-search></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-search")!)).toBe("3px")
  })

  it("takes a token set through `::part(input)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(input) { --ui-search-prompt-radius: 3px }</style><ui-search class="themed"></ui-search></div>`
    )
    expect(radius(wrapper.querySelector("ui-search")!)).toBe("3px")
  })

  it("takes a token set through `::part(search)`, the root", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(search) { --ui-search-prompt-radius: 3px }</style><ui-search class="themed"></ui-search></div>`
    )
    expect(radius(wrapper.querySelector("ui-search")!)).toBe("3px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-search-prompt-radius", "3px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-search-prompt-radius")
    })
    const { host } = await search(`<ui-search></ui-search>`)
    expect(radius(host)).toBe("3px")
  })

  it("keeps Fomantic's round prompt when nothing is set", async () => {
    const { host } = await search(`<ui-search></ui-search>`)
    expect(parseFloat(radius(host))).toBeGreaterThan(100)
  })
})

describe("<ui-search> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })

  it("axe passes with results showing, standard and category", async () => {
    const page = await ElementFixture.render(
      `<div><ui-search aria-label="Fruit"></ui-search><ui-search category aria-label="Food"></ui-search></div>`
    )
    const [standard, category] = page.querySelectorAll<Search>("ui-search")
    standard!.source = FRUIT
    category!.source = FOOD
    await ElementFixture.tick()
    await userEvent.type(standard!.shadowRoot!.querySelector("input")!, "ap")
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    await transitionsDone(page)
    await expectAccessible(page)
    await userEvent.type(category!.shadowRoot!.querySelector("input")!, "a")
    await ElementFixture.tick()
    await transitionsDone(page)
    await expectAccessible(page)
  })
})
