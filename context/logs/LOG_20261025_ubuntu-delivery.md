# Implementation and verification, 2026-10-25

Scope: personalized Ubuntu project site only. No boot-loader or other OS repositories edited.

Upstream: vivek9patel/vivek9patel.github.io master c4f1eff15aaba964fb0ad807afb4e233c33364dd, MIT copyright (c) 2020 vivek9patel. Account repository inventory showed no existing Ubuntu fork. Created true fork yuxiaoli/ubuntu-web; remote develop default verified. Master retained at upstream SHA, unchanged. Pages build_type workflow, cname null, project URL https://yuxiaoli.github.io/ubuntu-web/.

Untouched upstream build tested in separate detached worktree with frozen yarn.lock. Dependencies install successfully; build fails collecting / with `Require GA_MEASUREMENT_ID` when no inherited analytics ID is supplied. The personalized build removes all analytics initialization/calls and the inherited EmailJS contact UI/configuration. No private CV files copied; profile facts corroborated against public GitHub profile.

Implemented: About Sean/public links/credits; meaningful local Notes plus Download; local browser bookmarks/history retention and HTTP(S) validation; embedding fallback links; repaired empty VSCode/Spotify launcher returns; personalized terminal, context menu, metadata and startup links; non-destructive storage behavior; touch app launch/keyboard shortcuts/mobile window bounds. Runtime QA caught upstream clock server/client hydration mismatches; deterministic clock initial render fixed them.

Validation completed before deploy: 3 node:test cases (notes preserved including empty text, URL validation, saved-browser read without mutation); failing-to-passing coverage observed. Next production build + static export pass. Original LICENSE and yarn.lock unchanged. Browser checks use fresh isolated Chrome contexts and a loopback static server, with screenshots and JSON results saved outside source in ../.qa/evidence. Live verification follows deployment and will be recorded in the final delivery record.

Known limits: simulated desktop/terminal, not an actual operating system. External sites may block iframe embedding or need sign-in; open-in-new-tab links remain visible. Notes stay in this browser/origin/device and are not a backup service. Existing locked Next.js 13 dependencies are retained; production hosts only static export, no Next server. Build warns about old Browserslist data, experimental worker count, and font optimization when Google Fonts cannot be fetched; system sans-serif fallback works.

Local browser acceptance passed: fresh anonymous Chrome desktop at 1440x1000; startup, About/credits, Notes edit/close/reopen/reload persistence, terminal pwd, calculator 2+2, browser URL and fallback, VSCode/Spotify frame and fallback, settings and trash. 390x844 touch Notes and About passed with windows within viewport. Cross-origin loopback iframe harness could boot desktop and edit Notes. Zero own asset failures or uncaught page errors. Screenshots visually reviewed. Additional review fixed inherited-property terminal listing edge case. Original license and lockfile remain unchanged.

## Live acceptance

First deployed application commit: 871ef15bbcfd3483a50c2501e5d91f67f9ff7166.
Successful Pages run: https://github.com/yuxiaoli/ubuntu-web/actions/runs/40206597496 . Public build-info.json matched that SHA. The initial fork push did not queue a run; workflow_dispatch on develop queued this successful run after GitHub registered the new workflow.

At 2026-10-25T15:24:20Z, fresh anonymous Chrome live tests passed at https://yuxiaoli.github.io/ubuntu-web/: startup/About/credits, Notes across close/reopen/reload, terminal pwd, calculator, browser URL and new-tab fallback, VSCode/Spotify frames/fallback, Settings and Trash; 390x844 touch Notes/About; cross-origin iframe boot and Notes interaction. Zero own asset failures, zero uncaught desktop/mobile page errors. Live screenshots visually reviewed and retained in docs/verification along with structured results. These evidence files show the application commit above; the follow-up documentation commit changes only plan/log/evidence and will also deploy and be checked.

Remote state verified: true fork parent vivek9patel/vivek9patel.github.io; default develop; master unchanged at c4f1eff15aaba964fb0ad807afb4e233c33364dd; Pages workflow type, HTTPS enforced, cname null. No account-root site/domain, boot-loader, or other OS was changed. Delivery has no remaining permission/deployment blocker. External iframe contents may be blocked or require sign-in, so acceptance confirms app launch plus honest external fallback rather than claiming all providers permit embedding.
