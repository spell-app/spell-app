import { describe, test, expect } from "vite-plus/test"
import { spellCore, itemOf, positionOf, List } from "$/core"

/** Each old name, and the new one it now is -- epic `output-targets` P16. */
const RENAMED = {
  itemOf: "positionOf",
  getItemOf: "getItemAt",
  setItemOf: "setItemAt",
  removeItemOf: "removeItemAt",
  removeItemsOf: "removeItemsAt",
  duplicateCollection: "duplicateList",
  mergeCollections: "mergeLists",
  mergeCollectionsInto: "mergeListsInto"
} as const

describe("spellCore's old names, for programs compiled before P16", () => {
  test.each(Object.entries(RENAMED))("`%s` is `%s`", (oldName, newName) => {
    const core = spellCore as unknown as Record<string, unknown>
    expect(typeof core[newName]).toBe("function")
    expect(core[oldName]).toBe(core[newName])
  })

  test("they still work, as a program compiled before calls them", () => {
    const list = ["a", "b", "c", "d"]
    expect(spellCore.itemOf(list, "c")).toBe(3)
    expect(spellCore.getItemOf(list, 4)).toBe("d")
    spellCore.setItemOf(list, 1, "A")
    spellCore.removeItemOf(list, 2)
    spellCore.removeItemsOf(list, 1, 2)
    expect(list).toEqual(["d"])
    const copy = spellCore.duplicateCollection(list)
    spellCore.mergeCollectionsInto(copy, ["e"])
    expect(spellCore.mergeCollections([copy, ["f"]])).toEqual(["d", "e", "f"])
  })

  test("`itemOf`, imported by name, is `positionOf`;  a list's own `itemOf()` is its `positionOf()`", () => {
    expect(itemOf).toBe(positionOf)
    const list = new List<string>()
    list.add("x", "y")
    expect(list.itemOf("y")).toBe(list.positionOf("y"))
  })
})
