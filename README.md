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
components, a command line, and `@spell/ui`, a web component library that stands on its own.

## Packages

| Folder                                                       | Package                | What it is                                                                                                       |
| ------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`packages/spell`](packages/spell/readme.md)                 | `@spell/spell`         | The spell language, on the parser, and every spell project                                                       |
| [`packages/parser`](packages/parser/AGENTS.md)               | `@spell/parser`        | The generic rule-based parser the language is built on;  imported as `#parser`                                   |
| [`packages/spell-core`](packages/spell-core/AGENTS.md)       | `@spell/spell-core`    | The runtime compiled spell runs on;  imported as `#spell-core`                                                   |
| [`packages/spell-util`](packages/spell-util/AGENTS.md)       | `@spell/spell-util`    | Spell's utilities (lodash, `Observable`, `Task` ...);  imported as `#spell-util`                                 |
| [`packages/lsp`](packages/lsp/AGENTS.md)                     | `@spell/lsp`           | Spell's language server, browser-safe;  imported as `#lsp`                                                       |
| [`packages/spell-app`](packages/spell-app/AGENTS.md)         | `@spell/spell-app`     | The web app and its server, the runner, and the `<spell-app>` / `<spell-editor>` web components                  |
| [`packages/vscode`](packages/vscode)                         | `spell-language`       | The VS Code extension that runs the language server:  its own yarn project, not a workspace                      |
| [`packages/ui`](packages/ui/README.md)                       | `@spell/ui`            | Fomantic UI's vocabulary as modern-CSS web components on Solid 2, for any framework or plain HTML                |
| [`packages/solid-element`](packages/solid-element/README.md) | `@spell/solid-element` | Custom elements for Solid 2:  our fork of `@solidjs/element` + `component-register`                              |
| [`packages/cli`](packages/cli/README.md)                     | `@spell/cli`           | The `spell` command line:  compile, check, explore, watch, run and test spell projects                           |
| [`packages/util`](packages/util/README.md)                   | `@spell/util`          | Small generic helpers shared by the others (`@proto`, class, string and DOM utilities);  imported as `#util`    |
| [`packages/docs`](packages/docs/README.md)                   | `@spell/docs`          | Every package's docs as @spell/ui pages, their templates and plan docs;  start at `index.html`            |

Each package has its own README or `AGENTS.md` (how it's built).  Imports use one alias per package, `#parser`,
`#spell-core` ... -- the table is [`tsconfig.base.json`](tsconfig.base.json).  Dependencies flow one way:
`cli` -> `spell-app` -> `lsp` -> `spell` -> `parser` / `spell-core` -> `spell-util` -> `util`, and
`ui` -> `solid-element` / `util`.

## Getting started

You need Node 22.17 or later.  Yarn 4.18 comes with the repo (`.yarn/releases/`), so any `yarn` runs the right one.

```sh
git clone https://github.com/spell-app/spell.git
cd spell
yarn                # installs every package
```

Then, per package:

```sh
cd packages/spell-app && yarn start    # the web app and its server
yarn vscode                            # (at the root) build and install the VS Code extension
cd packages/ui    && yarn dev          # @spell/ui's demo pages, hot-reloading
cd packages/cli   && yarn cli:install  # put `spell` on your PATH
```

From the root, `yarn ts` and `yarn review` run in every package.  `review` also FIXES lint and formatting, so it
can change files.

`yarn test` is ONE vitest run over every package (the root `vitest.config.ts` lists them as `projects`):
- `yarn test --project spell` runs one project, named for its folder:  `spell`, `parser`, `spell-core`,
  `spell-util`, `lsp`, `spell-app`, `cli`, `solid-element`, plus `ui:ssr` and `ui:browser`.
- `yarn test:watch` is the watch mode, and the VS Code vitest extension reads the same config.
- `yarn test:packages` runs each package's own `yarn test` one after another, as before.

## Working in the repo

- [`AGENTS.md`](AGENTS.md):  the conventions every package follows, for people and coding agents alike.
  Each package's own `AGENTS.md` adds what's local to it.
- [`PAPERCUTS.md`](PAPERCUTS.md):  what slowed development down, and the fix.  Check it first when tooling fails
  mysteriously.
- [`SUSPECTED-BUGS.md`](SUSPECTED-BUGS.md):  things that look wrong but aren't confirmed yet.
- [`CODE-DEBT.md`](CODE-DEBT.md):  structural problems we've chosen not to fix yet, and why.

## History

This repo was `oakjs/parser` until 2026-09-30, when `@spell/ui` and the command line, until then repos of their
own, moved in with their full history.  Links to the old repo redirect here.

## License

[MIT](https://opensource.org/licenses/MIT).  Copyright &copy; 2017-2026 Matthew Owen Williams.
