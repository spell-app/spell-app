# @spell-app/util

Small generic helpers shared by `@spell-app/ui`, `spell` and the CLI.  Private for now (the npm scope isn't decided).

```ts
import { proto, kebabCase, closestAcrossShadow } from "$/util"
```

- `@proto` -- standard decorator that sets a class default on the prototype, so instances carry no copies
- `@protoMerged` -- `@proto` for a settings object whose keys merge down the class chain (`ui`'s `elementSetup`)
- `@lazy` -- a getter whose value is made on first read, then kept;  `@once` --
  a method that runs once and returns the same result after (a loader's promise);
  `forget(object, "name")` drops either's kept value;
  `@resets("name") accessor x` drops it on every write to `x` (`SiteData.url = ...` fetches again)
- `hasOwnProp` ... -- class helpers
- `kebabCase`, `camelCase`, `numberToWord`, `suggest` -- strings
- `closestAcrossShadow`, `isBrowser`, `nextFrame`, `whenDefined` -- DOM
- `Constructor`, `AbstractClass`, `Prettify` -- types

Not published on its own:  `@spell-app/ui` bundles what it uses.
It imports no other package and has no runtime dependencies.

`yarn review` runs `tsc`, oxlint, oxfmt and the tests (in a real browser).  See `AGENTS.md`.
