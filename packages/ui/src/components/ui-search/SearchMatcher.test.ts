import { describe, expect, test } from "vite-plus/test"

import type { UIT } from "$/ui/core"

import { SearchMatcher } from "./SearchMatcher"

/** Fruit, one with a price, one a link. */
const FRUIT: UIT.SearchResult[] = [
  { title: "Apple", description: "Crisp and sweet" },
  { title: "Apricot", description: "Soft", price: "$2.00" },
  { title: "Banana", description: "Yellow" },
  { title: "Grape", url: "#grape" },
  { title: "Pineapple", description: "Tropical" }
]

/** Food in categories. */
const FOOD: UIT.SearchResult[] = [
  { title: "Apple", category: "Fruit" },
  { title: "Asparagus", category: "Vegetables" },
  { title: "Avocado", category: "Fruit" },
  { title: "Almond" }
]

describe("SearchMatcher.search()", () => {
  test("puts word starts first, then matches anywhere (`exact`)", () => {
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

  test("matches in order with `fuzzy`, only word starts with `prefix`", () => {
    expect(new SearchMatcher({ match: "fuzzy" }).search(FRUIT, "bnn").map((result) => result.title)).toEqual(["Banana"])
    expect(new SearchMatcher({ match: "prefix" }).search(FRUIT, "pple").map((result) => result.title)).toEqual([])
    expect(new SearchMatcher({ match: "exact" }).search(FRUIT, "pple").map((result) => result.title)).toEqual([
      "Apple",
      "Pineapple"
    ])
  })

  test("matches any word with `some`, every word across fields with `all`", () => {
    expect(new SearchMatcher({ match: "some" }).search(FRUIT, "zzz yellow").map((result) => result.title)).toEqual([
      "Banana"
    ])
    expect(new SearchMatcher({ match: "all" }).search(FRUIT, "apple sweet").map((result) => result.title)).toEqual([
      "Apple"
    ])
  })

  test("searches the fields it's given, and folds diacritics on request", () => {
    const source = [{ title: "Café", code: 42 }]
    expect(new SearchMatcher({ fields: ["code"] }).search(source, "42")).toHaveLength(1)
    expect(new SearchMatcher().search(source, "cafe")).toHaveLength(0)
    expect(new SearchMatcher({ ignoreDiacritics: true }).search(source, "cafe")).toHaveLength(1)
  })
})

describe("SearchMatcher.categorize()", () => {
  test("groups by category, leaving uncategorized results out (as Fomantic)", () => {
    expect(SearchMatcher.categorize(FOOD).map((group) => [group.name, group.results.length])).toEqual([
      ["Fruit", 2],
      ["Vegetables", 1]
    ])
  })
})

describe("SearchMatcher.groupsFor()", () => {
  test("reads remote answers:  a list, `{ results }` capped at `maxResults`, keyed groups (empty ones dropped)", () => {
    expect(SearchMatcher.groupsFor({ results: FRUIT }, 2)[0]!.results).toHaveLength(2)
    expect(SearchMatcher.groupsFor(FRUIT)[0]!.results).toHaveLength(5)
    const keyed = { results: { fruit: { name: "Fruit", results: [FRUIT[0]!] }, none: { name: "None", results: [] } } }
    expect(SearchMatcher.groupsFor(keyed).map((group) => group.name)).toEqual(["Fruit"])
    expect(SearchMatcher.groupsFor({} as never)).toEqual([])
  })
})
