# A monorepo checkout's root files, frozen

Copies of spell-app main's root files from before epic `repo-split` P8 (`ee35f65c8`), when every package was in
`packages/`:  what `spell dev pack new` edits to wire a new component pack into a monorepo (`packNew.ts`).
- Its tests (`packNew.test.ts`, `packBuild.test.ts`) copy these into a throwaway checkout, never the live root's:
  spell-app's own root is no monorepo of every package any more.
- Frozen:  change them only with `packNew.ts` itself.
