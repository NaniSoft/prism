---
Type: task
Status: open
Labels: wayfinder:task, ready-for-human
---

## Question

Nothing to decide — human checklist; the accounts and wiring only a human can create:

- [ ] npm org `nanisoft` created; `@nanisoft` scope claimed; publish token stored for CI (secret name recorded in the Answer).
- [ ] Cloudflare: account confirmed; Workers + Static Assets usable; API token for `wrangler deploy` stored as a CI secret.
- [ ] DNS: `prism.nanisoft.com` record/route pointing at the site Worker (zone: nanisoft.com).
- [ ] GitHub org **NaniSoft**: repo `prism` created (done by ticket 06); Actions enabled; secrets added. Also flip **Settings → General → Pull Requests → "Allow GitHub Actions to create and approve pull requests"** — REST/GraphQL can't set it, so the changesets workflow can't open the version PR until a human does (found by ticket 06).
- [ ] Figma: **Professional** team/workspace "NaniSoft" created (libraries + variable modes are paid-only — see `.scratch/prism/research/04-figma-greenfield-setup.md`); one **Full seat** owns the `NaniSoft Design System` library; **Dev seats** for engineers (Dev Mode MCP budget: 200 read calls/day). The remote MCP endpoint works on any plan; the desktop endpoint additionally needs the desktop app + a paid seat.
- [ ] Record where every credential lives (password-manager entry names) in the Answer.

## Answer

<!-- facts later tickets depend on: URLs, secret names, account ids -->
