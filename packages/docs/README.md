# @spell/docs

Docs for every package in the repo, written as plain HTML pages that render with [`@spell/ui`](../ui/README.md).

Open [`index.spell.html`](index.spell.html) in a browser.  Pages load straight from disk:  no server, no build step
to read them.

| Folder                       | What's there                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `<topic>/`                   | One doc per topic, e.g. `solid/solid-2.spell.html`, plus its `experiments/`   |
| `templates/`                 | Starting points for each kind of doc                                          |
| `plans/`                     | Plan docs, one per `/plan-doc` session                                        |
| `spell-docs/`                | How the pages work, and the `@spell/ui` problems they turned up               |
| `_assets/`                   | The shared stylesheet, page script and `@spell/ui` bundle every page loads    |
| `scripts/`                   | The tooling                                                                   |

## Commands

From the repo root, or from this folder:

```sh
yarn docs:update      # rebuild the @spell/ui bundle from the latest UI, then check every page in a real browser
yarn docs:index       # rewrite the lists in index.spell.html after adding or renaming a page
```

How to write a page:  [`AGENTS.md`](AGENTS.md).
