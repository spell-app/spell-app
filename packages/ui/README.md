# @spell/ui

Fomantic UI's vocabulary reborn as `ui-*` web components on a modern CSS foundation:  shadow DOM, `@layer`s,
OKLCH tokens, anchor positioning, `<dialog>` / popover, and accessibility built in.  Usable from any framework
or plain HTML.

**Status:**  eight component families (button, dropdown, icon, label, content parts, divider, segment,
container) on Solid 2, through our fork of its custom-element layer (`packages/solid-element/`).  Measurements,
framework hosts, HMR and fallbacks:  [`docs/report.md`](docs/report.md).

```sh
yarn            # install (the fork, packages/solid-element, is its own yarn project:  yarn fork:install)
yarn dev        # tools/demo/:  every example, class grammar beside elements, hot-reloading
yarn review     # tsc + oxlint + oxfmt + tests (Vitest browser mode + node SSR, and the fork's)
yarn build      # library build into dist/
```

Design:  see [`docs/plan.md`](docs/plan.md) (and [`docs/`](docs/README.md) for the rest).
Conventions for humans and agents:  [`AGENTS.md`](AGENTS.md).
