const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeBrowserUrl, loadBrowserUrl } = require('../lib/browser-url.cjs');

test('the browser accepts web addresses and rejects executable or local schemes', () => {
  assert.equal(normalizeBrowserUrl(' vectorindex.cloud '), 'https://vectorindex.cloud/');
  assert.equal(normalizeBrowserUrl('https://github.com/yuxiaoli?tab=repositories'), 'https://github.com/yuxiaoli?tab=repositories');
  assert.equal(normalizeBrowserUrl('http://example.com/docs'), 'http://example.com/docs');
  for (const address of ['javascript:alert(1)', 'data:text/html,test', 'file:///secret', 'ftp://example.com', 'https://', 'https://user:password@example.com', '']) {
    assert.equal(normalizeBrowserUrl(address), null, address);
  }
});

test('restoring browser history never overwrites existing storage, including a saved home page', () => {
  const values = new Map([['chrome-url', 'https://example.com/kept'], ['chrome-display-url', 'My saved address']]);
  const storage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: () => { throw new Error('History must be read without writing'); },
  };
  assert.equal(loadBrowserUrl(storage), 'https://example.com/kept');
  assert.equal(values.get('chrome-display-url'), 'My saved address');
  values.set('chrome-url', '');
  assert.equal(loadBrowserUrl(storage), '');
  values.set('chrome-url', 'javascript:alert(1)');
  assert.equal(loadBrowserUrl(storage), '');
  assert.equal(values.get('chrome-url'), 'javascript:alert(1)');
});
