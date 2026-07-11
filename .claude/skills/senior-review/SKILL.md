---
name: senior-review
description: Reviews the current code changes via a simulated meeting between a Senior FE Engineer and a Senior Architect, checks that existing components/utils/patterns are reused instead of reinvented, fixes confirmed issues, verifies, and outputs feature-by-feature git commit commands with short one-liner messages. Use when the user asks to review recent changes, run a senior review/meeting, or wants help committing work in clean logical chunks.
---

# Senior Review

Simulates a code-review meeting between two independent senior personas, then fixes what's confirmed and hands back ready-to-run commit commands split by feature.

## When to use this

Trigger on requests like "review this before I commit", "have a senior dev and architect look at this", "run a senior review", or "help me commit this feature by feature". Works on the current uncommitted diff by default — ask the user if they mean something else (e.g. a specific PR, a specific set of files) if the working tree is clean or ambiguous.

## Step 1 — Scope the review

- Run `git status` and `git diff` (staged + unstaged) to find what changed. If the tree is clean, ask the user what to review (a branch diff, a set of files, or "the whole codebase").
- Read any architecture/plan docs in the repo (e.g. `docs/plan-*.md`, `docs/mindmap/`, `CLAUDE.md`, `AGENTS.md`) — these define the established patterns, existing components, and utility functions the review must check against.
- Note the existing component/util inventory (e.g. `components/ui/`, `components/media/`, `lib/utils/`) so both reviewers can check reuse, not just correctness.

## Step 2 — Run the meeting: two independent reviews in parallel

Spawn two `Agent` calls in **parallel** (single message, two tool calls), each reading the actual diff and surrounding code — not guessing. Give each the repo's established component/util inventory from Step 1 so they can check reuse specifically.

**Senior FE Engineer persona** — reviews:
1. **Reuse over reinvention** — does this change duplicate a component, hook, or utility that already exists (e.g. re-implementing a class-merge helper instead of using `lib/utils/format.ts`'s `cn`, or hand-rolling a card/grid/empty-state instead of reusing `components/ui/*` or `components/media/*`)? This is the #1 thing to catch — cite the existing file it should have used instead.
2. DRY/KISS — duplicated logic/markup that should be extracted; over- or under-engineered code.
3. Readability — naming, function length, comment quality (sparse, only non-obvious WHY).
4. Error handling — new failure paths, edge cases, off-by-ones.
5. Lightweight/perf — bundle size, unnecessary client components, image/caching hygiene.

**Senior Architect persona** — reviews:
1. **Pattern consistency** — does the change follow the established architecture (e.g. this repo's Adapter/Facade/Composite data-layer pattern, or whatever the repo's docs describe) instead of introducing a parallel, inconsistent approach?
2. Scalability — does it generalize, or does it hardcode something that'll need a rewrite for the next similar feature?
3. Folder/module structure — does the new code live where the existing structure says it should?
4. Whether it introduces drift from documented plans (check the docs found in Step 1).

Each agent must cite file paths + line numbers, separate findings into **What's Good / What Needs Improvement / How to Improve**, and only report issues actually verified by reading the code — not speculative.

## Step 3 — Reconcile into meeting minutes

Synthesize both reports yourself:
- Highlight findings both reviewers hit independently — these are the highest-confidence issues, prioritize them first.
- Produce one consolidated list: What's Good (real, specific strengths) / What Needs Improvement (prioritized P0→P2) / How to Improve (concrete fixes).
- Present this to the user before fixing, briefly — a short summary, not the full raw reports.

## Step 4 — Fix as a senior dev

Apply the confirmed fixes directly, prioritizing:
1. Actual bugs / correctness issues.
2. Reuse violations — replace reinvented code with the existing component/utility.
3. DRY/KISS cleanups.
Don't fix speculative or low-confidence findings without flagging them to the user first.

## Step 5 — Verify

Run whatever the repo actually has (check `package.json` scripts): typically lint, test, and build, in that order. Fix anything that breaks. Don't proceed to Step 6 with a red build/lint/test.

## Step 6 — Feature-by-feature commit commands

Group the final changes into small, logically-scoped commits (one feature/concern per commit — mirror how the changes were requested/implemented, not one giant commit). For each group, output:

```bash
git add <files for this feature>
git commit -m "<short, one-line, imperative message, no trailer>"
```

- Keep messages short and direct (e.g. "Fix composite provider fallback", "Extract EmptyState component") — no filler, no `Co-Authored-By` trailer unless the user asks for one.
- Order commits sensibly (foundational/shared code before code that depends on it).
- If `git commit` is blocked by the session's permission settings, present the full command block for the user to run themselves (prefix suggestion: `! <command>` if they want to run it inline) rather than repeatedly retrying.
- End with `git log --oneline -N` in the command block so the user can verify the result.
