---
Type: task
Status: resolved
Labels: wayfinder:task, ready-for-human
---

## Question

Nothing to decide — human checklist; the accounts and wiring only a human can create:

- [x] npm org `nanisoft` created; `@nanisoft` scope claimed; publish token stored for CI (secret name recorded in the Answer).
- [x] Cloudflare: account confirmed; Workers + Static Assets usable; API token for `wrangler deploy` stored as a CI secret.
- [x] DNS: no manual record needed — zone already on Cloudflare; Workers Custom Domain auto-creates the record on attach (see Answer).
- [x] GitHub org **NaniSoft**: repo `prism` created (done by ticket 06); Actions enabled; secrets added. Toggle **"Allow GitHub Actions to create and approve pull requests"** flipped ON (real path: Settings → Actions → General → Workflow permissions).
- [x] Figma: **Professional** team/workspace "NaniSoft" created (libraries + variable modes are paid-only — see `.scratch/prism/research/04-figma-greenfield-setup.md`); one **Full seat** owns the `NaniSoft Design System` library; **Dev seats** for engineers (Dev Mode MCP budget: 200 read calls/day). The remote MCP endpoint works on any plan; the desktop endpoint additionally needs the desktop app + a paid seat.
- [x] Credentials: user opted **not** to track them in a password manager — see Answer.

## Answer

- **npm**: org `nanisoft` created. Publish token = **org-level GitHub secret `NPM_TOKEN`** (granular, org-scoped, automation-type), shared with `NaniSoft/prism`. Note for later sessions: org secrets don't appear in repo-level `gh secret list` for non-admins — the first publish run is the real verification. Nothing published yet (`@nanisoft/prism-ui` → 404 as of 2026-09-14).
- **Cloudflare**: account confirmed — "Durga Prasad Reddy", id `3185310fec380cda3828cbdd9bd26be1`; local wrangler OAuth logged in (dp.vennapusa@gmail.com, workers write scopes). CI token = org-level GitHub secret **`CLOUDFLARE_API_TOKEN`**; the deploy lane also expects **`CLOUDFLARE_ACCOUNT_ID`** (value above).
- **DNS**: no manual record — the `nanisoft.com` zone already lives on Cloudflare (NS `mimi`/`rustam.ns.cloudflare.com`); attaching a Workers Custom Domain auto-creates `prism.nanisoft.com`. It not resolving today is expected pre-deploy.
- **GitHub**: toggle **"Allow GitHub Actions to create and approve pull requests" is ON** — verified `can_approve_pull_request_reviews: true` via `GET /repos/NaniSoft/prism/actions/permissions/workflow`; the changesets workflow can now open/approve the Version Packages PR. `default_workflow_permissions: read` is fine (workflows elevate at job level). Correct UI path: **Settings → Actions → General → Workflow permissions**, not Settings → Pull Requests as this checklist originally guessed.
- **Figma**: Professional team/workspace "NaniSoft" exists (human-verified; seat count / MCP budget not verifiable from the repo — the setup plan lives in `research/04-figma-greenfield-setup.md` and executes in ticket 14).
- **Credentials**: user decision — **not kept in a password manager**; if lost, regenerate from the npm org settings, Cloudflare dashboard API-tokens page, and Figma admin. GitHub CI access flows exclusively through the org-level secrets above.
- **Go-live reminder** (beyond this ticket): `release-pr.yml` still dry-runs; swapping to the real publish per its header comment is the arm step for the first actual npm publish — plus the license decision (ticket 17) must land first — not because npm rejects `UNLICENSED` at publish (it doesn't; `private: true` is the real hard blocker), but because publicly downloadable code with no license grant is legally incoherent. Resolved 2026-09-14: MIT (see ticket 17).

## Comments

### Agent verification — 2026-09-14

Read-only checks run while claiming, so the human checklist below is precise (done vs. remaining):

- **Cloudflare — account confirmed.** Locally logged in (dp.vennapusa@gmail.com), account "Durga Prasad Reddy", account id `3185310fec380cda3828cbdd9bd26be1`, OAuth token carries workers/workers_routes/workers_scripts write. Remaining: CI API token.
- **DNS zone already on Cloudflare.** `nanisoft.com` NS = `mimi`/`rustam.ns.cloudflare.com` — a Workers Custom Domain on the Worker can auto-create the `prism.nanisoft.com` record at attach time; no manual DNS entry needed. (`prism.nanisoft.com` does not resolve yet — expected pre-deploy.)
- **GitHub.** Repo `NaniSoft/prism` live (ticket 06); Actions running. **Repo secrets: none** (`gh secret list` empty). Read via API: `can_approve_pull_request_reviews: false` — the "Allow GitHub Actions to create and approve pull requests" toggle is **OFF**; UI path is Settings → Actions → General → Workflow permissions (not under Pull Requests as the original checklist guessed). `default_workflow_permissions` is `read`, which is fine — `release-pr.yml` elevates at job level.
- **npm.** `@nanisoft/prism-ui` → 404: org/scope not yet in use, nothing published.
- **Secret names the pipeline expects**: `NPM_TOKEN` (per `release-pr.yml` header: granular, org-scoped, automation-type) for publish; `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (`3185310fec380cda3828cbdd9bd26be1`) for the wrangler-deploy lane.
- `apps/site` has no wrangler config yet — deploy wiring is later-ticket work; this ticket is accounts/secrets/DNS only.
