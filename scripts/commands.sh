#!/usr/bin/env bash
# Node 22+, Yarn Classic 1.22.22
# Install exactly the locked dependencies.
yarn install --frozen-lockfile
# Develop at http://localhost:3000/ubuntu-web/
yarn dev
# Meaningful persistence and browser address tests.
yarn test
# Production static build and export.
yarn build
# CI stamps the source commit into out/build-info.json before upload.
node scripts/stamp-build.cjs
# Inspect deployment from a shell with existing GitHub authorization.
gh run list --repo yuxiaoli/ubuntu-web --branch develop
gh api repos/yuxiaoli/ubuntu-web/pages
