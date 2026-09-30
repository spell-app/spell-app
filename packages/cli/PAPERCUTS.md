# Papercuts

Log of things that slowed down development. Date · symptom · fix · project.

Entries before 2026-09-30 are from when the command line lived in the parser repo, on its `CLI` branch.

- 2026-09-28 · New `tsx` entry point died with `ERR_MODULE_NOT_FOUND: Cannot find package '~'` -- looked like
  `tsconfig` `paths` weren't applied, so time went on probing `tsx`'s `register({ tsconfig })`.  Real cause:  the
  FILE was gone (`~/spellVersion.node` had just been renamed to `~/packageVersion.node` by another session).  `tsx`
  reports a missing `~/` file as a missing PACKAGE `~`. · `ls` the target file first;  `~/<dir>` imports resolving
  while one `~/<file>` doesn't means that file is missing, not path mapping. · spell/cli
- 2026-09-28 · `npm prefix -g`'s `bin` is NOT on `PATH` under volta (only volta's shims in `~/.volta/bin` are), so a
  command linked there silently isn't found. · `scripts/install-cli.mjs` picks the first writable folder actually
  on `PATH`, starting with `~/.local/bin`. · spell/cli
- 2026-09-29 · After `yarn cli:install`, `spell compile @library` failed with zsh's `cd: too many arguments`:  a
  `~/.zprofile` alias `spell="cd ~/www/spell/parser"` shadowed the new command.  Non-login shells (e.g. an agent's
  `zsh -ic 'type spell'`) don't read `.zprofile`, so they reported the right command and hid it. · Renamed the alias
  `sp`.  When a command "can't be what it says", check `type -a <name>` in a LOGIN shell (`zsh -l`). · spell/cli
- 2026-09-29 · Driving an Ink screen through `script -q /dev/null ...` showed broken borders -- boxes' right edges
  20 columns short.  Not a bug:  `script`'s pty reports 0 columns, so Ink lays out to its 80-column default while
  the screen sized itself to its own fallback.  Also, rows = 0 makes Ink clear the WHOLE terminal every frame. ·
  Size the pty first:  `script -q /dev/null zsh -fc 'stty rows 30 cols 110; <command>'`.  Or render with
  `ink-testing-library` at a fixed `size`.  Fallbacks now match Ink's (80 x 24). · spell/cli
- 2026-09-29 · `spell watch` compiled the OLD text after a save, and showed ✓ for a file with an error.  On macOS,
  `fs.watch()` reports a plain save as `rename` -- and also replays the folder's own creation events the moment
  watching starts -- so `rename` read as "new file", and the workspace's "created" path keeps loaded files' text. ·
  Ignore `fs.watch()`'s event type:  decide from what's on disk now (gone / one of the project's files / new).
  Also watch BEFORE the first build. · spell/cli
- 2026-09-30 · Stripping colour codes from a pty capture of `spell explore` with
  `sed 's/\x1b\[[0-9;?]*[a-zA-Z]//g'` died with `sed: RE error: illegal byte sequence`:  macOS `sed` chokes on the
  box-drawing characters' bytes. · `perl -pe 's/\e\[[0-9;?]*[a-zA-Z]//g' <file>` instead. · spell/cli
