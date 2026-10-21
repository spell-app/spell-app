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

That's [`FizzBuzz.spell`](spaces/@spell/examples/fizzbuzz/FizzBuzz.spell),
one of the example projects.

It's built on a general-purpose, rule-based parser, whose grammar reads like regular expressions for words,
so other languages can be built on it too.

Around the language are the tools to write and run it:
- a language server
- a VS Code extension
- a web app with an editor
- embeddable `<spell-app>` / `<spell-editor>` web components
- a command line
- and `spell-ui`, a web component library that stands on its own

## Folders

This repo is ONE npm package, `spell-app` (epic `repo-split` P11):  each folder below is one of its entries.
The language, Spell UI and the kit are repos of their own beside it, inside the kit `spell-kit` (`~/www/spell`).

| Folder | Entry | What it is |
| --- | --- | --- |
| [`app`](app/AGENTS.md) | `spell-app/app` | The web app, the runner, and the `<spell-app>` / `<spell-editor>` web components |
| [`spaces`](spaces/AGENTS.md) | `spell-app/spaces/...` | Where projects and people live:  the example and library projects, project lists, and the servers that serve them |
| [`lsp`](lsp/AGENTS.md) | `spell-app/lsp` | Spell's language server, browser-safe;  imported as `$/lsp` |
| [`cli`](cli/README.md) | `spell-app/cli` | The `spell` command line:  compile, check, explore, watch, run and test spell projects |
| [`page-server`](page-server/AGENTS.md) | `spell-app/page-server` | What only spell-app's page server does, on the kit's generic one |
| [`vscode`](vscode) | `spell-language` | The VS Code extension that runs the language server:  its own yarn project, not part of `spell-app` |

The other repos:
- [spell-lang](../spell-lang/README.md), the package `spell-lang`:  the parser, the spell language (`spell-lang/spell`),
  its runtime and its writers.
- [spell-ui](../spell-ui/README.md), the package `spell-ui`:  Fomantic UI's vocabulary as modern-CSS web components on
  Solid 2, for any framework or plain HTML.
- The kit, the package `spell-kit`:  small generic helpers (`spell-kit/util`), the toolchain, the generic page server,
  and what makes a custom element.

The epic engine -- epic pages' `<epic-*>` elements, the `epic` command, every docs page's tooling, and the Claude Code
plugin of hooks and skills -- is NOT a folder here:  it's spell-epic, a repo of its own beside this one
(`../spell-epic`).  [AGENTS.md](AGENTS.md), "spell-epic".

Each folder has its own README or `AGENTS.md` (how it's built).
- Imports use one alias per folder, `$/app`, `$/spaces` ...:
  the table is [`tsconfig.base.json`](tsconfig.base.json).
  Another repo's package goes by its npm name, `spell-lang/spell`, `spell-ui/core` ...
- Dependencies flow one way:

  ```text
  cli -> app -> lsp -> spaces -> spell-lang -> spell-kit
  app -> spell-ui -> spell-kit
  ```

## Getting started

You need Node 24.11 or later.
The kit holds the ONE install for every repo, and the yarn release (in `.yarn/releases/`), so any `yarn` runs the
right one.

```sh
cd ~/www/spell && yarn     # once, at the kit's root:  every repo's packages
cd spell-app
yarn start                 # the web app and its server
yarn cli:install           # put `spell` on your PATH
spell dev vscode           # build and install the VS Code extension (needs `spell`, above)
```

The scripts are the root's, wherever you run them:  the folders have no `package.json` of their own.
- The app's keep their names (`start`, `build`, `build:element` ...);  the language server's are `lsp:start` and
  `lsp:scopes`;  the command line's, `spell` and `cli:install`.

From the root, `yarn ts`, `yarn test`, `yarn lint`, `yarn format` and `yarn review` run folder by folder
(`spell-folders`, the root `package.json`'s `"spellFolders"`).
`review` also FIXES lint and formatting, so it can change files.
- `yarn spell-folders test spaces` runs one folder's (or a few:  name them).
- `yarn vitest` is ONE vitest run over every folder:  the root's `vitest.config.ts` lists them as `projects`.
  - `yarn vitest --project spaces` runs one project, named for its folder:
    `spaces`, `lsp`, `app:node`, `app:browser`, `cli`, `page-server`
  - `yarn test:watch` is the watch mode, and the VS Code vitest extension reads the same config.

## Working in the repo

- [`AGENTS.md`](AGENTS.md):  the conventions every folder follows, for people and coding agents alike.
  Each folder's own `AGENTS.md` adds what's local to it.
- [The papercuts log](agents/PAPERCUTS.md):  what slowed development down, and the fix.
  Check it first when tooling fails mysteriously.
- [The suspected-bugs log](agents/SUSPECTED-BUGS.md):  things that look wrong but aren't confirmed yet.
- [The code-debt log](agents/CODE-DEBT.md):  structural problems we've chosen not to fix yet, and why.

## History

This repo was `oakjs/parser` until 2026-09-30.
- Then `spell-ui` and the command line, until then repos of their own, moved in with their full history.
- Links to the old repo redirect here.

## License

[MIT](https://opensource.org/licenses/MIT).  Copyright &copy; 2017-2026 Matthew Owen Williams.
