import { describe, test, expect } from "vite-plus/test"
import { core, itemOf, positionOf, List } from "$/core"

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

describe("core's old names, for programs compiled before P16", () => {
  test.each(Object.entries(RENAMED))("`%s` is `%s`", (oldName, newName) => {
    const methods = core as unknown as Record<string, unknown>
    expect(typeof methods[newName]).toBe("function")
    expect(methods[oldName]).toBe(methods[newName])
  })

  test("they still work, as a program compiled before calls them", () => {
    const list = ["a", "b", "c", "d"]
    expect(core.itemOf(list, "c")).toBe(2)
    expect(core.getItemOf(list, 3)).toBe("d")
    core.setItemOf(list, 0, "A")
    core.removeItemOf(list, 1)
    core.removeItemsOf(list, 0, 1)
    expect(list).toEqual(["d"])
    const copy = core.duplicateCollection(list)
    core.mergeCollectionsInto(copy, ["e"])
    expect(core.mergeCollections([copy, ["f"]])).toEqual(["d", "e", "f"])
  })

  test("`itemOf`, imported by name, is `positionOf`;  a list's own `itemOf()` is its `positionOf()`", () => {
    expect(itemOf).toBe(positionOf)
    const list = new List<string>()
    list.add("x", "y")
    expect(list.itemOf("y")).toBe(list.positionOf("y"))
  })
})
