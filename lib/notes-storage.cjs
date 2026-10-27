const NOTES_KEY = 'ubuntu-sean-notes-v1';
const WELCOME_VERSION_KEY = 'ubuntu-sean-notes-welcome-version';
const WELCOME_VERSION = '2026-10-27:fe7e9edba1d4cbbe07d44e43dea42bd5e3f234b7';
const STARTER_NOTES = require('./welcome-text.json');
const PREVIOUS_STARTER_FINGERPRINT = Object.freeze({ byteLength: 550, sha256: "4381fa036fa122f67a3f6869e91fd336efb7deb6f990d93e465d022daf34e758" });

const WELCOME_UPSTREAM_CREDIT = "Original Ubuntu simulation: Vivek Patel, MIT license.\n";
function _welcomeHistoryByteLength(text) {
        var bytes = 0;
        for (var i = 0; i < text.length; i += 1) {
            var code = text.charCodeAt(i);
            if (code < 0x80) bytes += 1;
            else if (code < 0x800) bytes += 2;
            else if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length &&
                text.charCodeAt(i + 1) >= 0xDC00 && text.charCodeAt(i + 1) <= 0xDFFF) {
                bytes += 4;
                i += 1;
            } else bytes += 3;
        }
        return bytes;
    }
function _welcomeHistorySha256(text) {
        if (typeof text !== 'string') return null;
        var bytes = new Uint8Array(_welcomeHistoryByteLength(text)), at = 0;
        for (var i = 0; i < text.length; i += 1) {
            var code = text.charCodeAt(i);
            if (code >= 0xD800 && code <= 0xDBFF) {
                var low = text.charCodeAt(i + 1);
                if (!(low >= 0xDC00 && low <= 0xDFFF)) return null;
                code = 0x10000 + ((code & 0x3FF) << 10) + (low & 0x3FF);
                i += 1;
            } else if (code >= 0xDC00 && code <= 0xDFFF) return null;
            if (code < 0x80) bytes[at++] = code;
            else if (code < 0x800) {
                bytes[at++] = 0xC0 | (code >>> 6); bytes[at++] = 0x80 | (code & 63);
            } else if (code < 0x10000) {
                bytes[at++] = 0xE0 | (code >>> 12); bytes[at++] = 0x80 | ((code >>> 6) & 63); bytes[at++] = 0x80 | (code & 63);
            } else {
                bytes[at++] = 0xF0 | (code >>> 18); bytes[at++] = 0x80 | ((code >>> 12) & 63);
                bytes[at++] = 0x80 | ((code >>> 6) & 63); bytes[at++] = 0x80 | (code & 63);
            }
        }
        var padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
        padded.set(bytes); padded[bytes.length] = 0x80;
        var view = new DataView(padded.buffer);
        view.setUint32(padded.length - 8, Math.floor(bytes.length / 0x20000000), false);
        view.setUint32(padded.length - 4, (bytes.length * 8) >>> 0, false);
        var hash = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
        var k = [
            0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
            0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
            0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
            0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
            0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
            0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
            0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
            0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
        ];
        var words = new Uint32Array(64);
        function rotate(value, bits) { return (value >>> bits) | (value << (32 - bits)); }
        for (var offset = 0; offset < padded.length; offset += 64) {
            for (i = 0; i < 16; i += 1) words[i] = view.getUint32(offset + i * 4, false);
            for (i = 16; i < 64; i += 1) {
                var x = words[i - 15], y = words[i - 2];
                var small0 = rotate(x, 7) ^ rotate(x, 18) ^ (x >>> 3);
                var small1 = rotate(y, 17) ^ rotate(y, 19) ^ (y >>> 10);
                words[i] = (words[i - 16] + small0 + words[i - 7] + small1) >>> 0;
            }
            var a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
            for (i = 0; i < 64; i += 1) {
                var sum1 = rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25);
                var choice = (e & f) ^ (~e & g);
                var temp1 = (h + sum1 + choice + k[i] + words[i]) >>> 0;
                var sum0 = rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22);
                var majority = (a & b) ^ (a & c) ^ (b & c);
                var temp2 = (sum0 + majority) >>> 0;
                h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
            }
            var result = [a,b,c,d,e,f,g,h];
            for (i = 0; i < 8; i += 1) hash[i] = (hash[i] + result[i]) >>> 0;
        }
        return hash.map(function (word) { return ('00000000' + word.toString(16)).slice(-8); }).join('');
    }
function createNotesStorage(fingerprint = PREVIOUS_STARTER_FINGERPRINT) {
function isPreviousStarter(value) { return typeof value === "string" && _welcomeHistoryByteLength(value) === fingerprint.byteLength && _welcomeHistorySha256(value) === fingerprint.sha256; }
function loadNotes(storage) {
  const saved = storage.getItem(NOTES_KEY);
  if (saved === null) {
    // No document model exists. A version marker plus missing key is deletion evidence.
    try { return storage.getItem(WELCOME_VERSION_KEY) === null ? STARTER_NOTES : ''; }
    catch { return ''; }
  }
  if (!isPreviousStarter(saved)) return saved;
  try {
    if (storage.getItem(WELCOME_VERSION_KEY) !== null) return saved;
    // Mark first: if the note write fails, preserve the old string and never retry it.
    storage.setItem(WELCOME_VERSION_KEY, WELCOME_VERSION);
    const current = storage.getItem(NOTES_KEY);
    if (!isPreviousStarter(current)) return current === null ? '' : current;
    storage.setItem(NOTES_KEY, STARTER_NOTES);
    return STARTER_NOTES;
  } catch {
    return saved;
  }
}
function saveNotes(storage, text) {
  // Explicit edits, even a deliberate copy of the old welcome, must never be migrated.
  storage.setItem(WELCOME_VERSION_KEY, WELCOME_VERSION);
  storage.setItem(NOTES_KEY, text);
}
return { loadNotes, saveNotes, isPreviousStarter };
}
const { loadNotes, saveNotes } = createNotesStorage();

module.exports = { NOTES_KEY, WELCOME_VERSION_KEY, WELCOME_VERSION, STARTER_NOTES, loadNotes, saveNotes, PREVIOUS_STARTER_FINGERPRINT, createNotesStorage };
