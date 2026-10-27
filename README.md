# Sean's Ubuntu desktop

A personalized Ubuntu 20.04 web simulation for Sean (Yuxiao Li), forked from [Vivek Patel's original project](https://github.com/vivek9patel/vivek9patel.github.io).

- Live project site: https://yuxiaoli.github.io/ubuntu-web/
- Homepage: https://vectorindex.cloud
- GitHub: https://github.com/yuxiaoli

## Development

Use Node 22 or newer and Yarn Classic 1.22.22. The existing yarn.lock is authoritative.

```sh
yarn install --frozen-lockfile
yarn dev
# Open http://localhost:3000/ubuntu-web/
yarn test
yarn build
# Static output is in out/, mounted at /ubuntu-web/.
```

The locked Next.js 13.1.2 stack uses `next build && next export`. `next start` previews the Next build but is not the production hosting model. Production is a static GitHub Pages export with no server, credentials or contact service.

## Branches and deployment

`develop` is the default and customization branch. Preserve `master` (and any `main`) as read-only upstream caches, synchronized manually by the user only. Do not merge personalization into them or add automatic upstream sync.

The Pages workflow runs only on pushes to `develop` or explicit dispatch. It tests, builds, stamps `build-info.json` with the actual source SHA, uploads the export, and deploys to the `github-pages` environment. It does not modify an account-root Pages site, custom domain, or another OS repository.

## Apps and saved data

- About Sean: public professional context, links and original author/license credits.
- Notes: editable local text, automatic browser storage and Download backup. Existing saved text, including empty notes, is preserved. The approved welcome is used for fresh storage; only a matching exact UTF-8 byte length and SHA-256 fingerprint of the previous starter is eligible for the one-time migration.
- Browser: local bookmarks and validated HTTP(S) addresses. Prior browser history keys remain intact. Each external view has a visible new-tab fallback because sites can block embedding.
- Terminal and calculator: simulations. The terminal supports `help`, `pwd`, `ls`, `cd`, `echo`, `mkdir`, `clear`, `exit`, and app shortcuts. It is not a real shell.
- Settings, Trash, VSCode and Spotify retain the original app roles. External apps depend on their providers and may require sign-in.

Notes use `ubuntu-sean-notes-v1`. The separate `ubuntu-sean-notes-welcome-version` marker records migration or an explicit save. Edited text and empty strings are never migrated. A missing text key with a marker stays absent; fresh missing storage is not seeded. Ubuntu has no document rename/delete model, so an unmarked missing key cannot distinguish first use from external key removal. Unknown keys are never modified. Existing desktop/background/folder/browser/About keys are retained. Data stays on the current browser/origin and is not synchronized. This fork does not initialize inherited analytics or EmailJS services. No private CV files were copied or published.

The migration detector retains only a 550-byte length and SHA-256 digest; it does not embed or export the previous welcome biography. Synchronous SHA-256 uses pinned `@noble/hashes` 1.8.0; its [MIT license](public/licenses/noble-hashes.txt) is included in the static export. Tests use synthetic text and fingerprints, with no reversible old-text fixture in the repository. A real legacy-positive release check may use a disposable local fixture via `UBUNTU_LEGACY_NOTE_FIXTURE`; remove it after verification. This forward change does not rewrite history.

The exact 525-byte welcome comes from DOT_NOTES `projects/repos/boot-loader/welcome.md` at `bb681b8fd0085af3cc15ef02e6da1b955404e5ce`, blob `fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7`. Its wording, punctuation, six paragraphs and final link remain unchanged. Storage read/write failures preserve readable saved text; localStorage does not provide cross-tab transactions, so migration rechecks immediately before replacement.

Verify the compiled Notes module without opening a browser:

```sh
yarn build
node scripts/stamp-build.cjs
node scripts/verify-welcome.cjs out
node scripts/verify-welcome.cjs https://yuxiaoli.github.io/ubuntu-web/ <expected-develop-sha>
```

## Provenance and license

Original project: [vivek9patel/vivek9patel.github.io](https://github.com/vivek9patel/vivek9patel.github.io), upstream master `c4f1eff15aaba964fb0ad807afb4e233c33364dd`. Original code is MIT licensed, copyright (c) 2020 vivek9patel; [LICENSE](LICENSE) is retained verbatim. Ubuntu and application names/artwork belong to their respective owners. Personalization is maintained in this fork.

See `context/plans/PLAN.md` for requested scope and `context/logs/` for verified delivery evidence and limitations.
