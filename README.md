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
| [`packages/spell`](packages/spell/readme.md)                 | `spell-parser`         | The parser, the spell language, its runtime, language server, web app, VS Code extension and every spell project |
| [`packages/ui`](packages/ui/README.md)                       | `@spell/ui`            | Fomantic UI's vocabulary as modern-CSS web components on Solid 2, for any framework or plain HTML                |
| [`packages/solid-element`](packages/solid-element/README.md) | `@spell/solid-element` | Custom elements for Solid 2:  our fork of `@solidjs/element` + `component-register`                              |
| [`packages/cli`](packages/cli/README.md)                     | `@spell/cli`           | The `spell` command line:  compile, check, explore, watch, run and test spell projects                           |

Each package has its own README (how to use it) and `AGENTS.md` (how it's built).  They're split further as the
monorepo settles -- the generic parser, the runtime and the language server each become their own package.

## Getting started

You need Node 22.17 or later.  Yarn 4.18 comes with the repo (`.yarn/releases/`), so any `yarn` runs the right one.

```sh
git clone https://github.com/spell-app/spell.git
cd spell
yarn                # installs every package
```

Then, per package:

```sh
cd packages/spell && yarn start        # the web app and its server
cd packages/spell && yarn vscode       # build and install the VS Code extension
cd packages/ui    && yarn dev          # @spell/ui's demo pages, hot-reloading
cd packages/cli   && yarn cli:install  # put `spell` on your PATH
```

From the root, `yarn ts`, `yarn test` and `yarn review` run in every package.  `review` also FIXES lint and
formatting, so it can change files.

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
