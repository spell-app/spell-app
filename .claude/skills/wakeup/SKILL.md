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
3. Change the first line to `<!-- bedtime: done -->`.
4. Reply:  the Summary, judgement calls by phase (`J<k>`) and problems (short), then AskUserQuestion, "Where first?":
   - the top problems / judgement calls ("Look at J2:  ...")
   - "Merge into `main`" (runs `/isolate done`'s steps, which ask again before merging)
   - "All fine"
5. Digging into a judgement call:  show the code it produced and the alternatives.  Changed it:  record that
   (plan doc:  close its `Review:` todo, `add ... decision`;  else a line in the MORNING PLAN).
6. Every item dealt with:  ask whether to delete `MORNING-<name>.md`.
