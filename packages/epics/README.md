# `$/epics` -- a component pack of `<epic-*>` elements

Custom elements a page loads ON DEMAND.
Written exactly like Spell UI's own element families, on `$/spell-solid` and Spell UI's `$/ui/core`.
- `<ui-root>` reads [the pack's script](components/__pack/epics.pack.js) when the page names it.
  - It's a classic script, so it works from `file://` too.
- It shows each tag's skeleton until it's defined, then defines them all.

```html
<ui-root>
  <ui-components source="../../packages/epics/components/__pack/epics.pack.js"></ui-components>
  <epic-...> ... </epic-...>
</ui-root>
```

The page must load Spell UI's docs bundle FIRST ([spell-ui.js](tools/_assets/spell-ui.js), in the docs tools):
- the pack registers there (`SpellUI.registerPack()`)
- and takes Solid and Spell UI's shared code from it (`SpellUI.packModules`)

## The DRY rule (one of each)

If you find yourself writing a second copy of any of these, stop and reuse.

- the pack's build, catalog and staleness check:  the CLI's, `spell dev pack` ([packBuild.ts](../cli/src/dev/packBuild.ts))
- reading a vocabulary's tag and skeleton:  Spell UI's `RootCatalog` ([RootCatalog.ts](../ui/tools/RootCatalog.ts))
- the element authoring API:  `$/spell-solid`, and Spell UI's `$/ui/core`

## Files

| Path | What |
| --- | --- |
| `components/<tag>/` | one element family:  component, vocabulary, sheet, barrel (files named for the component);  its test is in `tests/epics/components/<tag>/` |
| `components/index.ts` | `$/epics/components`:  every family barrel (defines every tag:  SIDE EFFECT) |
| `src/index.ts` | `$/epics` (`EP`):  code the elements and the node tools share |
| `src/definitions/` | the ONE description of every element:  its vocabulary as data, plus the children it takes |
| `src/markup/` | read, write and check an epic page's `<epic-*>` markup through the definitions (node and browser) |
| `src/review/` | the page's two server clients, each POSTing and watching through a `ServerLink` (the token and its refresh):  `ReviewClient`, the review inbox's (reads and writes, polling, note-draft backups), which the elements' review controls use;  `AgentsClient`, the running agents', for `<epic-page>`'s "Agents running" panel |
| `src/answers/` | `$/epics/answers`:  the pages Owen answers on (epic `epic-workflow` P12) -- a details page's answer (`AnswerForm`:  gathered from its `<epic-ask>`s and `<epic-text-box>`es, sent, read back) and a choice page's boxes (`ChoicesForm`:  the draft, "Do it") |
| `src/links/` | `$/epics/links`:  short addresses (`SAGA:/<saga>/<epic>#<id>`) and `<epic-link>`'s attributes as a page and an id (`EpicAddress`), and what a page holds to land on (`PageTargets`);  pure, for the elements, the docs runtime and the tool (epic `epic-workflow` P15) |
| `src/convert/` | the converter (`spell dev plan-doc convert`):  an epic page in the old markup => `<epic-*>` markup, with a proof that no id, link or word was lost;  every live doc was converted at P12, and it stays for a doc restored from an old backup |
| `src/tool/` | the `epic` tool (`spell dev plan-doc`), node only, not in the pack;  `PLAN-DOC.md`, the rules for a doc's data;  `templates/plan.html`, a new doc |
| `tests/epics/src/pack.test.ts` (repo root) | runs `spell dev pack check epics`:  `components/__pack/` and `docs/__data/` are current |
| `components/__pack/` | GENERATED, committed:  `epics.catalog.ts`, `epics.entry.ts`, `epics.pack.js` |
| `docs/` | Epic UI, the elements' docs pages, served at `/components/epics/`:  `index.html`, `<tag>.html`, `__parts/`, `__data/` ([AGENTS.md](AGENTS.md), "Epic UI, the docs set") |
| `src/site/` | `EpicUISite`:  `docs/__data/`'s generated files (`yarn site:data`) |
| `vite.config.ts` | lint and format only:  the build is the CLI's |
| `vitest.config.ts` | `node` (`src/`) and `browser` (`components/`) projects, over the repo's `tests/epics/` |

## Adding a new element

1. `spell dev pack element epics epic-<name>`:
   - writes the family's folder, `components/epic-<name>/`
   - adds it to [the barrel](components/index.ts)
   - rebuilds `components/__pack/`
2. Fill in its vocabulary (description, `topics`, `aka`, attributes, parts, skeleton), its class and sheet
3. Its page in `docs/`, `epic-<name>.html`:  a copy of a page like it.
   Then `yarn site:data`.
4. `yarn pack:build`, then `yarn review`
5. Commit the pack and the docs set (`components/__pack/`, `docs/`) with the change
