const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
fs.writeFileSync('out/build-info.json', JSON.stringify({ commit, branch: 'develop', upstream: 'c4f1eff15aaba964fb0ad807afb4e233c33364dd' }, null, 2));
fs.writeFileSync('out/.nojekyll', '');
