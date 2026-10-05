---
name: comment
description: Let Owen review files by commenting inline, in the editor tab Claude Code's plan mode opens for a plan -- one file per round:  Claude copies the file into the plan, Owen comments or approves, Claude applies the comments and shows it again until he approves, then writes it back.  Use for `/comment <file> [<file> ...]` (globs OK), or when Owen says "let me comment on <file>", "show me <file> so I can comment", "review these in the plan tab".
argument-hint: "<file> [<file> ...]"
---

# /comment

Review any file through PLAN MODE's comment tab:  the plan Claude asks to approve opens in an editor tab, where Owen
comments inline before approving or sending feedback.  That tab only ever shows the harness's ONE plan file, so each
file gets its own ROUND:  its text goes into the plan file, Owen comments, Claude revises the copy, until he approves.

- Why plan mode:  it's the only place Owen can leave comments ON the text, line by line, without editing the file.
- The plan file is a COPY.  The real file changes only once Owen approves its round (step 5).

## Steps

1. Files:  `$ARGUMENTS`, in order;  expand globs;  each path relative to the repo root (or absolute).  None:  ask
   which, in AskUserQuestion.  Say the round count in one line ("10 files, one round each").
2. `EnterPlanMode` (Owen approves entering).  The harness names the plan file:  every round writes THAT file.
   - Already in plan mode:  carry on with it.
3. Write the plan file for this file (Write tool, whole file):
   ```
   # Review <n>/<total>:  `<path>`

   Comment inline;  approve when it's right (approve = I write it back to `<path>`, then the next file).
   <round 2+:  "Changed since last round:" -- one bullet per comment applied, and the answer to any question>

   ---

   <the file's text, verbatim>
   ```
   - `.md`:  the text as is, so it renders.  Anything else:  in one fenced block with its language (` ```ts `).
   - Over ~600 lines:  say so in the header;  still one round (Owen picked one per file).
4. `ExitPlanMode`.  Then, by what comes back:
   - **Feedback / comments** (plan rejected, still in plan mode):  apply each comment to the COPY in the plan file
     -- the only file plan mode lets you edit.  A question:  answer it in "Changed since last round", change the
     text only if the answer calls for it.  A comment you disagree with:  apply it anyway unless it breaks another
     rule, and say why in the header.  Then `ExitPlanMode` again (next round of the SAME file).
   - **Approved** (plan mode is over):  step 5.
5. Write the reviewed text back to the real file:  the plan file's body below the `---`, with the header and (for
   non-`.md`) the fence stripped.  Check it:  `git diff --stat <path>` shows only what the comments changed.
   - The file is a generated or checked one (a plan doc, a WWOD file):  run its check (`yarn plan-doc check`,
     `cites.py` ...).
6. Next file:  step 2.  After the last:  one line per file ("`<path>`:  N rounds, M comments applied" or "approved
   as is"), and stage the changes (commit only when Owen says).

## Notes

- An epic running:  log each file's round count in its plan doc (`yarn plan-doc log <name> "..."`);  a comment that
  changes a decision becomes a `decision` item.
- NEVER apply Owen's comments to the real file while still in plan mode (it can't be edited there), and never skip
  write-back:  the plan file is overwritten by the next round.
- Comments arrive as quoted lines + Owen's text, or as general feedback;  map each to the line it quotes.  Unsure
  which line:  ask in the next round's header, don't guess.
