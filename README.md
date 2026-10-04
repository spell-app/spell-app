# Spell

Spell is a programming language written in plain English, compiled to JavaScript:

```
to play fizzbuzz
	for each number from 1 to 100
		if the number divided by 15 is an integer: print the number, "fizzbuzz"
		otherwise if the number divided by 3 is an integer: print the number, "fizz"
		otherwise if the number divided by 5 is an integer: print the number, "buzz"
		otherwise print the number

play fizzbuzz
```

That's [`FizzBuzz.spell`](packages/spell/projects/system/examples/FizzBuzz/FizzBuzz.spell), one of the example
projects.

It's built on a general-purpose, rule-based parser whose grammar reads like regular expressions for words, so
other languages can be built on it too.  Around the language are the tools to write and run it:  a language
server, a VS Code extension, a web app with an editor, embeddable `<spell-app>` / `<spell-editor>` web
components, a command line, and `@spell-app/ui`, a web component library that stands on its own.

## Packages

| Folder                                                       | Package                | What it is                                                                                                       |
| ------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`packages/spell`](packages/spell/readme.md)                 | `@spell-app/spell`         | The spell language, on the parser, and every spell project                                                       |
| [`packages/parser`](packages/parser/AGENTS.md)               | `@spell-app/parser`        | The generic rule-based parser the language is built on;  imported as `$/parser`                                   |
| [`packages/core`](packages/core/AGENTS.md)       | `@spell-app/core`    | The runtime compiled spell runs on;  imported as `$/core`                                                   |
| [`packages/lsp`](packages/lsp/AGENTS.md)                     | `@spell-app/lsp`           | Spell's language server, browser-safe;  imported as `$/lsp`                                                       |
| [`packages/app`](packages/app/AGENTS.md)         | `@spell-app/app`     | The web app and its server, the runner, and the `<spell-app>` / `<spell-editor>` web components                  |
| [`packages/vscode`](packages/vscode)                         | `spell-language`       | The VS Code extension that runs the language server:  its own yarn project, not a workspace                      |
| [`packages/ui`](packages/ui/README.md)                       | `@spell-app/ui`            | Fomantic UI's vocabulary as modern-CSS web components on Solid 2, for any framework or plain HTML                |
| [`packages/solid-element`](packages/solid-element/README.md) | `@spell-app/solid-element` | Custom elements for Solid 2:  our fork of `@solidjs/element` + `component-register`                              |
| [`packages/cli`](packages/cli/README.md)                     | `@spell-app/cli`           | The `spell` command line:  compile, check, explore, watch, run and test spell projects                           |
| [`packages/util`](packages/util/README.md)                   | `@spell-app/util`          | Small generic helpers shared by the others (`@proto`, class, string and DOM utilities);  imported as `$/util`    |
| [`packages/docs`](packages/docs/README.md)                   | `@spell-app/docs`          | Every package's docs as @spell-app/ui pages, their templates and plan docs;  start at `index.html`            |

Each package has its own README or `AGENTS.md` (how it's built).  Imports use one alias per package, `$/parser`,
`$/core` ... -- the table is [`tsconfig.base.json`](tsconfig.base.json).  Dependencies flow one way:
`cli` -> `app` -> `lsp` -> `spell` -> `parser` / `core` -> `util`, and
`ui` -> `solid-element` / `util`.

## Getting started

You need Node 22.17 or later.  Yarn 4.18 comes with the repo (`.yarn/releases/`), so any `yarn` runs the right one.

```sh
git clone https://github.com/spell-app/spell-app.git
cd spell-app
yarn                # installs every package
```

Then, per package:

```sh
cd packages/app && yarn start    # the web app and its server
yarn vscode                            # (at the root) build and install the VS Code extension
cd packages/ui    && yarn dev          # @spell-app/ui's demo pages, hot-reloading
cd packages/cli   && yarn cli:install  # put `spell` on your PATH
```

From the root, `yarn ts` and `yarn review` run in every package.  `review` also FIXES lint and formatting, so it
can change files.

`yarn test` is ONE vitest run over every package (the root `vitest.config.ts` lists them as `projects`):
- `yarn test --project spell` runs one project, named for its folder:  `spell`, `parser`, `core`,
  `lsp`, `app`, `cli`, `solid-element`, plus `util:browser`, `util:spell`, `ui:ssr` and `ui:browser`.
- `yarn test:watch` is the watch mode, and the VS Code vitest extension reads the same config.
- `yarn test:packages` runs each package's own `yarn test` one after another, as before.

## Working in the repo

- [`AGENTS.md`](AGENTS.md):  the conventions every package follows, for people and coding agents alike.
  Each package's own `AGENTS.md` adds what's local to it.
- [`agents/PAPERCUTS.md`](agents/PAPERCUTS.md):  what slowed development down, and the fix.  Check it first when tooling fails
  mysteriously.
- [`agents/SUSPECTED-BUGS.md`](agents/SUSPECTED-BUGS.md):  things that look wrong but aren't confirmed yet.
- [`agents/CODE-DEBT.md`](agents/CODE-DEBT.md):  structural problems we've chosen not to fix yet, and why.

## History

This repo was `oakjs/parser` until 2026-09-30, when `@spell-app/ui` and the command line, until then repos of their
own, moved in with their full history.  Links to the old repo redirect here.

## License

[MIT](https://opensource.org/licenses/MIT).  Copyright &copy; 2017-2026 Matthew Owen Williams.
