# Ubuntu desktop personalization and Pages delivery

Requested 2026-10-25. Canonical active plan.

## Scope and constraints

- Fork vivek9patel/vivek9patel.github.io (MIT) into yuxiaoli; reuse any existing fork. Account inventory inspected: no existing Ubuntu fork. Choose noncolliding ubuntu-web project repository; never replace an account-root site or change domains.
- Preserve master/main as read-only upstream caches for user manual sync. All changes on develop, verified remote default develop.
- Personalize natural desktop/profile/About/terminal/Notes/browser bookmarks with Sean (Yuxiao Li), yuxiaoli GitHub and https://vectorindex.cloud. Only public professional facts; never publish private CV files or secrets. Retain original author/license credits.
- Review all shipped apps; preserve existing localStorage and saved notes. Provide usable local starter Notes and browser home plus honest external-content fallback. No ad spam, paid services or new credential grants.
- Deploy an actual tested develop commit using GitHub Pages project path. Verify anonymous desktop/mobile layout, startup/apps/links/assets/routes and iframe embedding.
- Do not edit boot-loader, Win11 or other OS projects. Deliver verified URL to parent for sole owner integration.

## Execution and acceptance

1. Inspect protocol, instructions, upstream/license/current commit/build and account resources. Record upstream baseline and branch state.
2. Establish fork/develop/default branch before substantive changes. Keep master unchanged.
3. Implement focused personalization in existing Next.js/Tailwind stack; configure static export/subpath and develop-only Pages workflow. Preserve storage keys, add Notes without overwriting existing data, remove inherited analytics/contact credentials.
4. Install locked dependencies; verify baseline and final build, meaningful persistence/navigation tests and app runtime. Repair discovered issues.
5. Commit/review/push develop, deploy Pages, verify deployed SHA and actual anonymous desktop/mobile/iframe flows. Document limitations and source provenance.

## Initial findings

- Upstream master c4f1eff15aaba964fb0ad807afb4e233c33364dd, MIT copyright (c) 2020 vivek9patel.
- Next.js 13, React 18, Tailwind 3, yarn.lock; existing legacy workflow targets master and inherited EmailJS/analytics public identifiers. No AGENTS.md/CLAUDE.md or earlier plans found in project.
- CLI network works with sandbox escalation; authenticated account yuxiaoli confirmed. Connector lacks fork/admin/Pages mutation, so use authorized gh CLI.
- yuxiaoli/cv is private: no CV files copied/published. Public GitHub profile corroborates Sean, Hong Kong, Vector Index and homepage.

## Progress

- [x] Source, license, protocol and account inventory inspected.
- [x] Fork and branch/default verified.
- [x] Personalization and static build implemented.
- [x] Local checks and runtime verified.
- [ ] Commit pushed, Pages deployed and live checks completed.
