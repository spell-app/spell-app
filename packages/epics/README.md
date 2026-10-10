# `$/epics` -- a component pack of `<epic-*>` elements

Custom elements a page loads ON DEMAND.
Written exactly like Spell UI's own element families, on its `$/ui/core`.
- `<ui-root>` reads [the pack's script](pack/epics.pack.js) when the page names it.
  - It's a classic script, so it works from `file://` too.
- It shows each tag's skeleton until it's defined, then defines them all.

```html
<ui-root>
  <ui-components source="../../packages/epics/pack/epics.pack.js"></ui-components>
  <epic-...> ... </epic-...>
</ui-root>
```

The page must load Spell UI's docs bundle FIRST ([spell-ui.js](../docs/tools/_assets/spell-ui.js), in the docs tools):
- the pack registers there (`SpellUI.registerPack()`)
- and takes Solid and Spell UI's shared code from it (`SpellUI.packModules`)

## The DRY rule (one of each)

If you find yourself writing a second copy of any of these, stop and reuse.

- the pack's build, catalog and staleness check:  the CLI's, `spell dev pack` ([packBuild.ts](../cli/src/dev/packBuild.ts))
- reading a vocabulary's tag and skeleton:  Spell UI's `RootCatalog` ([RootCatalog.ts](../ui/tools/RootCatalog.ts))
- the element authoring API:  `$/ui/core`

## Files

| Path | What |
| --- | --- |
| `components/<tag>/` | one element family:  component, vocabulary, sheet, test, barrel (files named for the component) |
| `components/index.ts` | `$/epics/components`:  every family barrel (defines every tag:  SIDE EFFECT) |
| `src/index.ts` | `$/epics` (`EP`):  code the elements and the node tools share |
| `src/definitions/` | the ONE description of every element:  its vocabulary as data, plus the children it takes |
| `src/markup/` | read, write and check a plan doc's `<epic-*>` markup through the definitions (node and browser) |
| `src/review/` | the page's server clients, each POSTing and watching through a `ServerLink` (the token and its refresh):  the review inbox's, `ReviewClient` (reads and writes, polling, note-draft backups;  the elements' review controls use it);  the running agents', `AgentsClient` (`<epic-page>`'s "Agents running" panel) |
| `src/convert/` | the converter:  a plan doc in the old markup => `<epic-*>` markup (`spell dev plan-doc convert`), with a proof that no id, link or word was lost.  Every live doc was converted at P12;  it stays for a doc restored from an old backup |
| `src/tool/` | the plan-doc tool (`spell dev plan-doc`), node only;  not in the pack.  `PLAN-DOC.md`:  the rules for a doc's data.  `templates/plan.html`:  a new doc |
| `src/pack.test.ts` | runs `spell dev pack check epics`:  `pack/` is current |
| `pack/` | GENERATED, committed:  `epics.catalog.ts`, `epics.entry.ts`, `epics.pack.js` |
| `vite.config.ts` | lint and format only:  the build is the CLI's |
| `vitest.config.ts` | `node` (`src/`) and `browser` (`components/`) projects |

## Adding a new element

1. `spell dev pack element epics epic-<name>`:
   writes `components/epic-<name>/`, adds it to `components/index.ts`, and rebuilds `pack/`
2. Fill in its vocabulary (description, `topics`, `aka`, attributes, parts, skeleton), its class and sheet
3. `yarn pack:build`, then `yarn review`;  commit `pack/` with the change

## Deferred

- Docs pages for the elements (Spell UI's site data reads only Spell UI's own families)
