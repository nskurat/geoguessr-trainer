---
name: review-agent-pr
description: Review, fix up and finish a pull request opened by another coding agent (GitHub Copilot coding agent, a Claude session, a subagent) in this repo — check out its branch, run the checks and the browser smoke test, compare other countries against main, verify facts against sources, fix small things on the branch, give batched feedback, and merge only when the user said so. Use when asked to review, collaborate with, or finish an agent's PR (e.g. "Copilot finished, check it").
---

# Review an agent's PR

Another agent did the work; you make sure it is right and finish it. Be fast and concrete:
verify, fix what is small, ask the agent for what is large, and keep the user informed in
plain words.

## Routine

1. **Read the PR**: description, commits, comments, check runs. Copilot's CI waits for a
   maintainer's "Approve and run workflows" click; a push from the user's account runs CI
   without it.
2. **Check out the branch in a worktree** (never on top of your own work):
   `git fetch origin <branch> && git worktree add -B <branch> <scratch>/wt origin/<branch>`,
   then `npm ci` there.
3. **Run everything**: `npm run typecheck`, `npm run lint`, `npm test`, `npm run validate:data`,
   `npm run build`, then `npm run smoke -- <country> --shots` and look at the screenshots in
   `.cache/smoke/<country>/` (labels readable, rivers on their real courses, dots on the right
   side of borders, small units reachable, Belarusian fits).
4. **Prove other countries are unchanged**: on main, `npm run build && npm run smoke --
   --snapshot main.json`; on the branch, `npm run smoke -- --compare main.json`. Explain any
   difference (intended or a regression).
5. **Read shared-code changes line by line** (`app/`, `services/`, `scripts/`, `types/`). Agents
   fix real bugs there (Copilot found the outline builder's horizontal squash) but also change
   rules to make their data pass: a validator change must be a correct general rule.
6. **Verify facts against sources** your environment can reach (Wikipedia, slounik.org /
   skarnik.by for Belarusian, GeoNames, Natural Earth). Agents often work behind a firewall
   and fill gaps from memory; check what their RESEARCH.md marks L/M.
7. **Common data mistakes seen so far**: `lengthIsTotal` set on domestic rivers (only rivers
   that leave the country); a label of an enclosing unit sitting on the enclosed one (use
   `departmentLabelOffsets`, e.g. Brandenburg/Berlin); Belarusian numeral forms (5 зямель, not
   земляў: check the grammar dictionary); copy that mentions a set the country does not offer.

## Feedback and finishing

- **Small fixes: do them yourself** on the agent's branch (commit message says what and why),
  when the user asked you to finish the PR. Larger asks go to the agent.
- **Batch feedback into one comment.** Each `@copilot` comment starts a new billed Copilot
  session. End comments with the Claude Code footer; they post under the user's account.
- **Admit your own mistakes plainly** to the user; do not post a correction the agent already
  made (it costs a session).
- **Merge only on the user's instruction** (the owner has said: merge each PR once CI is
  green). After merging: check the Pages deploy and the live site, unsubscribe from the PR,
  remove the worktree.

## Working with the other roles

Use `geoguessr-pro` to judge set decisions and facts, `ux-expert` for what the screenshots
should look like, and `add-country` as the checklist the agent should have followed. When a
review finds a mistake that could recur, add it to the relevant skill instead of only fixing it.
