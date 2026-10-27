const { createHash } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const productionFingerprints = require('../tests/legacy-welcome-fingerprints.json');
const textExtensions = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.json', '.map', '.css', '.svg', '.txt', '.xml', '.webmanifest', '.manifest', '.csv', '.md']);

function digest(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

function decodeJsEscapes(text) {
  const escapedCharacters = { '\\': '\\', '/': '/', "'": "'", '"': '"', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v', 0: '\0' };
  return text.replace(/\\(?:u\{([\da-fA-F]{1,6})\}|u([\da-fA-F]{4})|x([\da-fA-F]{2})|([\\\/'"bfnrtv0])|\r?\n)/g, (match, point, unicode, hex, character) => {
    if (point !== undefined) {
      const value = parseInt(point, 16);
      return value <= 0x10ffff ? String.fromCodePoint(value) : match;
    }
    if (unicode !== undefined) return String.fromCharCode(parseInt(unicode, 16));
    if (hex !== undefined) return String.fromCharCode(parseInt(hex, 16));
    return character === undefined ? '' : escapedCharacters[character];
  });
}

function findLegacyMatches(text, fingerprints = productionFingerprints) {
  if (typeof text !== 'string') throw new TypeError('Asset text must be a string');
  for (const fingerprint of fingerprints) {
    if (!Number.isInteger(fingerprint.characters) || fingerprint.characters < 1 || !/^[\da-f]{64}$/i.test(fingerprint.sha256) || typeof fingerprint.label !== 'string') {
      throw new Error('Invalid fingerprint configuration');
    }
  }
  const variants = [{ text, representation: 'raw' }];
  let decoded = text;
  for (let pass = 0; pass < 3; pass++) {
    const next = decodeJsEscapes(decoded);
    if (next === decoded) break;
    if (!variants.some(variant => variant.text === next)) variants.push({ text: next, representation: 'decoded' });
    decoded = next;
  }
  const matches = [];
  for (const fingerprint of fingerprints) {
    let found = false;
    for (const variant of variants) {
      for (let offset = 0; offset + fingerprint.characters <= variant.text.length; offset++) {
        if (digest(variant.text.slice(offset, offset + fingerprint.characters)) === fingerprint.sha256.toLowerCase()) {
          matches.push({ label: fingerprint.label, representation: variant.representation });
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }
  return matches;
}

async function listTextAssets(directory) {
  const root = path.resolve(directory);
  if (!(await fs.lstat(root)).isDirectory()) throw new Error('Artifact target must be a directory');
  const files = [];
  async function visit(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Artifact symlinks are not supported');
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push({ absolute, relative: path.relative(root, absolute).split(path.sep).join('/') });
      }
    }
  }
  await visit(root);
  return files;
}

async function scanArtifact(directory, baseUrl, options = {}) {
  const fingerprints = options.fingerprints || productionFingerprints;
  const fetchAsset = options.fetchImpl || globalThis.fetch;
  const files = await listTextAssets(directory);
  if (!files.length) throw new Error('No text assets found in the artifact');
  const expected = [];
  let localBytes = 0;
  for (const file of files) {
    const bytes = await fs.readFile(file.absolute);
    const matches = findLegacyMatches(bytes.toString('utf8'), fingerprints);
    if (matches.length) throw new Error(`Legacy fingerprint detected in artifact asset ${file.relative} (${matches.map(match => match.label).join(', ')})`);
    expected.push({ relative: file.relative, digest: digest(bytes) });
    localBytes += bytes.length;
  }
  let remoteBytes = 0;
  let remoteTextAssets = 0;
  let base;
  if (baseUrl) {
    base = new URL(baseUrl);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('Public base URL must use HTTPS without credentials, query or fragment');
    if (!base.pathname.endsWith('/')) base.pathname += '/';
    let cursor = 0;
    const failures = [];
    async function worker() {
      while (cursor < expected.length) {
        const entry = expected[cursor++];
        try {
          const resource = entry.relative.split('/').map(encodeURIComponent).join('/');
          const response = await fetchAsset(new URL(resource, base), { signal: AbortSignal.timeout(20000), headers: { 'Cache-Control': 'no-cache' } });
          if (response.status !== 200) throw new Error('Unexpected HTTP status');
          const bytes = Buffer.from(await response.arrayBuffer());
          if (digest(bytes) !== entry.digest) throw new Error('Served bytes do not match the deployment artifact');
          const matches = findLegacyMatches(bytes.toString('utf8'), fingerprints);
          if (matches.length) throw new Error('Legacy fingerprint detected in served bytes');
          remoteBytes += bytes.length;
          remoteTextAssets++;
        } catch {
          failures.push(entry.relative);
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(6, expected.length) }, worker));
    if (failures.length) throw new Error(`Served asset verification failed for ${failures.length} asset(s): ${failures.join(', ')}`);
  }
  return {
    artifactDirectory: path.resolve(directory),
    ...(base ? { publicBaseUrl: base.href } : {}),
    localTextAssets: expected.length,
    localBytes,
    remoteTextAssets,
    remoteBytes,
    legacyFingerprintMatches: 0,
    decodedEscapePasses: 3,
    ...(base ? { servedBytesMatchArtifact: true } : {}),
    verification: 'noninteractive complete-current-text-asset scan; no browser or UI',
    checkedAt: new Date().toISOString(),
  };
}

module.exports = { decodeJsEscapes, findLegacyMatches, listTextAssets, scanArtifact };
if (require.main === module) {
  if (!process.argv[2]) {
    console.error('Usage: node scripts/scan-legacy-welcome.cjs <artifact-dir> [https-base-url]');
    process.exitCode = 1;
  } else {
    scanArtifact(process.argv[2], process.argv[3]).then(summary => console.log(JSON.stringify(summary, null, 2))).catch(error => {
      console.error(JSON.stringify({ error: error.message }));
      process.exitCode = 1;
    });
  }
}
