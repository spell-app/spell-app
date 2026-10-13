import { describe, expect, test } from "vite-plus/test"

import { absoluteImports } from "$/app/runner"

describe("absoluteImports()", () => {
  test("makes relative imports absolute, so a `blob:` copy can load them", () => {
    const source = `import{a as b}from"./spell-shared.js";import "../x.js";const c=import("./lazy.js");import d from "react"`
    expect(absoluteImports(source, "https://example.com/element/spell-runtime.js")).toBe(
      `import{a as b}from"https://example.com/element/spell-shared.js";import "https://example.com/x.js";` +
        `const c=import("https://example.com/element/lazy.js");import d from "react"`
    )
  })
})
