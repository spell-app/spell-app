# @spell-app/util

Small generic helpers shared by `@spell-app/ui`, `spell` and the CLI.  Private for now (the npm scope isn't decided).

```ts
import { proto, kebabCase, closestAcrossShadow } from "$/util"
```

- `@proto` -- standard decorator that sets a class default on the prototype, so instances carry no copies
- `hasOwnProp` ... -- class helpers
- `kebabCase`, `camelCase`, `numberToWord`, `suggest` -- strings
- `closestAcrossShadow`, `isBrowser`, `nextFrame`, `whenDefined` -- DOM
- `Constructor`, `AbstractClass`, `Prettify` -- types
- `$/util/reactive` -- the shared reactive engine:  spell cells, `getProp` / `setProp`, `getState` / `setState`,
  `@prop` / `@state` / `@derived`, `bridgeSolid()`.  Generic, no lodash or Solid;  see `AGENTS.md`

Not published on its own:  `@spell-app/ui` bundles what it uses.  It imports no other package and has no runtime
dependencies.

`yarn review` runs `tsc`, oxlint, oxfmt and the tests (in a real browser).  See `AGENTS.md`.
