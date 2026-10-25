function normalizeBrowserUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const address = value.trim();
  try {
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(address);
    const url = new URL(hasScheme ? address : (address.startsWith('//') ? `https:${address}` : `https://${address}`));
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

function loadBrowserUrl(storage) {
  return normalizeBrowserUrl(storage.getItem('chrome-url')) || '';
}

module.exports = { normalizeBrowserUrl, loadBrowserUrl };
