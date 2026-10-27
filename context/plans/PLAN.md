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
- [x] Commit pushed, Pages deployed and live checks completed.

## Approved welcome rollout - 2026-10-27

Scope is ubuntu-web only. Task recorded in DOT_NOTES at
`576d1f662328419937b0cc690ac4e73c4f149f52`. Use every UTF-8 byte of
`projects/repos/boot-loader/welcome.md` at `bb681b8fd0085af3cc15ef02e6da1b955404e5ce`,
Git blob `fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7` (525 bytes, six paragraphs,
no trailing newline). Keep the final Keep exploring link and separate upstream credits.

1. Recheck clean checkout, latest remote develop, instructions and existing rollout inventory.
   Create feature/ubuntu-welcome-rollout from current origin/develop; no main/master writes.
2. Replace only the previous Notes starter. Keep ubuntu-sean-notes-v1 and all user-edited or
   empty strings. Add one-time versioned recognition of the exact previous default only.
   Preserve unknown storage keys and missing values; do not invent rename/delete support.
3. Test exact source bytes/hash, fresh/legacy/edited/empty/missing/renamed-like storage,
   idempotence and storage errors. Build the existing static export and stamp its source SHA.
4. Open a draft PR to develop, review its substantive diff and checks, then merge normally
   under the granted rollout approval. Respect any platform protections and required reviews.
5. Deploy the actual merged develop commit through the existing Pages workflow. Verify public
   build-info and compiled default text plus persistence behavior through noninteractive
   unit/DOM/HTTP checks only. No UI or user browser control, credentials, other repos,
   history rewrites, force pushes, or G:/H: storage.

Progress: preflight, implementation, 10 regression tests and static build/export pass. Independent review identified an intervening-change gap; a final equality recheck and failing-to-passing regression preserve intervening edits/empty/removal. The rollout PR records final review, merge and deployment evidence for its exact commits; this change authorizes no browser/UI tests.

## Remove legacy plaintext migration data - 2026-10-27

Follow-up scope: ubuntu-web current source and deployed assets only. History cleanup remains
separately pending scoped planning/backups; no history rewrite or master/main mutation here.

1. From latest origin/develop, replace the old welcome literal and export with a one-way
   SHA-256 + exact UTF-8 byte-length detector. Keep the synchronous storage API and UI.
   Use a pinned browser-compatible SHA-256 implementation instead of introducing async UI
   behavior or implementing a new hash algorithm.
2. Preserve the same note key/version, marker ordering, no-write absence, edited/empty data,
   failure handling and final pre-write recheck. Tests use synthetic fingerprint metadata,
   not a retained plaintext/encoded/compressed copy of the old biography.
3. Verify a real legacy-positive case with a disposable local fixture, then delete that
   fixture. Verify canonical welcome bytes remain unchanged. Scan the complete static export
   and served current text assets for old biography phrases without retaining them in source.
4. Independent review, draft PR/checks/normal merge to develop, deploy the exact merge commit
   with the existing Pages workflow, verify build-info/current assets and migration safety.
   Use noninteractive tests/HTTP only; no user browser control, other repositories, credentials,
   force pushes, history rewrite, G:/H: writes or removal of upstream credits/licenses.

Final review, merge and deployment evidence will be recorded in the follow-up PR.
