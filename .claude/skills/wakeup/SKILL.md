---
name: wakeup
description: Leave `/bedtime` mode -- normal rules again (ask before committing, stop between phases), then walk Owen through the morning plan `MORNING-<name>.md`.  Use for `/wakeup`, or when Owen says he's back from a `/bedtime` run ("good morning", "I'm up").
---

# /wakeup

End bedtime mode (`.claude/skills/bedtime/SKILL.md`, step 4):  its overrides stop now, and the root rules and
memory apply again -- ask before committing, stop after each phase, modals for questions.

1. Find the MORNING PLAN:  `MORNING-*.md` at the worktree root (or the main checkout's root).  None:  say "no
   bedtime run found" and stop.  Several:  AskUserQuestion, which one.
2. Still running (first line `<!-- bedtime: active -->` and phases unfinished in this session):  say which phase it
   was on, and that it stops now.
3. Change the first line to `<!-- bedtime: done -->`.  In a worktree:  check the session's name
   (`.claude/skills/isolate/SKILL.md`, "Session name").
4. Judgement calls to review (any `J<k>`), or more than 4 things to pick from:  a MORNING REVIEW page (Owen,
   2026-10-03;  the first was `epics/details/details/morning-review.html`):
   - the spec:  `where`:  the epic, just now "ran P<a>-P<b> overnight:  <done / WIP / skipped>", decides "which of
     the night's calls stand, and what to look at first"
   - one question per call, `title` what was decided in plain words (the `J<k>` after, in brackets), `text` the
     choice and why;  options "Keep it" (`recommended`), each alternative it names, "Talk it over"
   - then one `multiple` question, "Where first?":  the problems, follow-ups and "Merge into `main`"
   - in an epic:  `--epic <name>`, slug `morning-review` (`-2` ... when taken)
   - `yarn details new <slug> --from <spec.json>`, `yarn details show <slug> --wait` in the background, then the
     reply:  the Summary, the problems (short), the page's link pair (`yarn docs:link`), and END THE TURN
   - woken:  per call, "Keep it":  close its `Review:` todo;  an alternative:  step 5's "Changed it";  "Talk it
     over":  step 5.  Then "Where first?"'s picks, in order
   Else, reply:  the Summary, judgement calls by phase (`J<k>`) and problems (short), then AskUserQuestion, "Where first?":
   - the top problems / judgement calls ("Look at J2:  ...")
   - "Merge into `main`" (runs `/isolate done`'s steps, which ask again before merging)
   - "All fine"
5. Digging into a judgement call:  show the code it produced and the alternatives.  Changed it:  record that
   (plan doc:  close its `Review:` todo, `add ... decision`;  else a line in the MORNING PLAN).
6. Every item dealt with:  ask whether to delete `MORNING-<name>.md`.
