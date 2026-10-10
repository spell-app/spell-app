# `templates/`

The files `spell` commands write new files from.
Today, only component packs use them:

- `pack/package/` -- a new pack, `packages/<name>/`:  `spell dev pack new <name> [--prefix x-]`
- `pack/element/` -- one element in a pack, `packages/<pack>/components/<tag>/`:
  `spell dev pack element <pack> <tag>`

The code that reads them:  `newPack()` and `newElement()`, in [packNew.ts](../src/dev/packNew.ts).

## How a template is filled

Each file is copied to the same path in the new folder, with three changes:

- `.template` comes off the end:  `src/index.ts.template` => `src/index.ts`.
- Each `__token__` is filled in, in the file's text AND its name:
  - `__pack__` -- the pack's name, `epics`
  - `__packCamel__` -- the same in camelCase, `my-pack` => `myPack`
  - `__prefix__` -- its tag prefix, `epic-`
  - `__solid__` -- the Solid version pinned in the root `package.json`'s `resolutions`
  - element files only:
    - `__tag__` -- the tag, `epic-page`
    - `__Class__` -- its class name, `EpicPage`
    - `__vocab__` -- the start of its vocabulary's name, `epicPage` (as in `epicPageVocabulary`)
    - `__noun__` -- the tag less the prefix, `page`
    - `__nounCamel__` -- the same in camelCase
  - Any other `__word__` is left as it is.
  - The list lives in `PackTokens` ([packNew.ts](../src/dev/packNew.ts)):  a new token goes there first.
- `gitignore.template` becomes `.gitignore`.
  A file named `.gitignore` here would be read by git as this folder's own.

So for `spell dev pack element epics epic-page`, this line of `pack/element/__Class__.en.ts.template`:

```ts
export const __vocab__Vocabulary = {
  tag: "__tag__",
```

is written to `packages/epics/components/epic-page/EpicPage.en.ts` as:

```ts
export const epicPageVocabulary = {
  tag: "epic-page",
```

Two files are written another way:

- `pack/package/package.json.template` is MERGED into the pack's `package.json`, when there is one:
  - the keys it lacks are added (inside `scripts`, `devDependencies` and `spellPack` too, one by one)
  - its own values are kept
- `pack/package/components/index.ts.template` starts the pack's element list.
  `pack element` then adds one `export * from "./<tag>"` line to it per element.

A file that's already there is NEVER overwritten:  it's skipped, and the command says so.
So running a command twice changes nothing.

## Why `.template`

Without it, these files would look like real code, and none of it works with `__token__`s in them:
- `tsc` would type-check `__Class__.tsx`
- lint and format would read it
- vitest would run `__Class__.test.tsx`

With the suffix, no tool reads them;  only `packNew.ts` does.

## Adding or changing a template

- Add a file:  put it where it goes in the new folder,
  with `.template` on the end, and `__token__`s where the names go.
  - `packNew.ts` copies every `*.template` file it finds:  no list to update.
- Change one:  just edit it.
  Packs and elements made AFTER get the change;  existing ones keep their files.
- Then run `yarn test` in `packages/cli`.
  - [packNew.test.ts](../src/dev/packNew.test.ts) writes a pack and an element from these templates
    into a temp folder, and checks every token was filled in.
