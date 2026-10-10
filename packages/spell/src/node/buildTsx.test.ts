import { describe, test, expect } from "vite-plus/test"

import { buildTsx } from "$/spell/node/buildTsx"
import { solidSample } from "$/spell/test"

/**
 * `buildTsx()`:  Solid TypeScript, as the `ts/solid` target writes it, into JavaScript that runs.
 * - That it RUNS, drawing and handling clicks:  `cli`'s `runCommand.test.ts`.
 */
describe("buildTsx()", () => {
  test("leaves no types, decorators or JSX:  Solid's DOM calls instead, from `@solidjs/web`", async () => {
    const built = await buildTsx(solidSample(), { filename: "Cards.compiled.tsx" })
    expect(built).not.toMatch(/^\s*@(prop|drawn|thing)\b|\baccessor rank\b|\bas const\b|<Show\b|<For\b/m)
    expect(built).toMatch(/^import \{ template as _\$template \} from "@solidjs\/web";$/m)
    expect(built).toContain(`import { Show, For } from "solid-js"`)
    expect(built).toContain(`from "@spell/core"`)
  })

  test("keeps class names:  `Thing.type` reads them", async () => {
    const built = await buildTsx(solidSample())
    expect(built).toMatch(/__name\(_?Card, "Card"\)|class Card extends Thing/)
  })

  test("throws for code that isn't TSX", async () => {
    await expect(buildTsx("const = <div", { filename: "Broken.compiled.tsx" })).rejects.toThrow(/Broken\.compiled\.tsx/)
  })
})
