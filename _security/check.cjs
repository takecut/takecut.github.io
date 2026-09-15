'use strict';
// Dependency-free guardrails for this static site, not a general vulnerability scanner.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { Script } = require('node:vm');
const root = path.resolve(__dirname, '..');
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const pages = tracked.filter(file => file.endsWith('.html'));
const write = process.argv.includes('--write');
const cspMeta = /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*>\s*/gi;
const referrerMeta = /<meta\s+name="referrer"\s+content="[^"]*"\s*>\s*/gi;

function policy(file, html) {
  // Browsers normalize line endings before checking inline script hashes.
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter(match => !/\bsrc\s*=/i.test(match[1]))
    .map(match => "'sha256-" + crypto.createHash('sha256').update(match[2].replace(/\r\n?/g, '\n')).digest('base64') + "'");
  const home = file === 'index.html';
  // Only the home page uses Google Ads. Other pages allow no third-party JS.
  const google = home ? ' https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com' : '';
  const googleScripts = home ? ' https://www.googletagmanager.com/gtag/js https://www.googleadservices.com/pagead/ https://www.google.com/pagead/ https://googleads.g.doubleclick.net/pagead/ https://pagead2.googlesyndication.com/pagead/' : '';
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'none'",
    "script-src 'self'" + (hashes.length ? ' ' + [...new Set(hashes)].join(' ') : '') + googleScripts,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:" + google + (home ? ' https://www.google-analytics.com https://google.com https://www.google.com.br' : ''),
    "connect-src 'self'" + google + (home ? ' https://www.google-analytics.com https://ad.doubleclick.net https://google.com https://www.google.com.br' : ''),
    "media-src 'self'",
    "frame-src " + (home ? 'https://www.youtube-nocookie.com https://www.youtube.com https://www.googletagmanager.com' : "'none'"),
    "worker-src 'none'",
    "manifest-src 'self'",
    'upgrade-insecure-requests'
  ].join('; ') + ';';
}

for (const file of pages) {
  const filename = path.join(root, file);
  let html = fs.readFileSync(filename, 'utf8');
  const expected = policy(file, html);
  if (write) {
    const newline = html.includes('\r\n') ? '\r\n' : '\n';
    html = html.replace(cspMeta, '').replace(referrerMeta, '');
    html = html.replace(/(<meta\s+charset="UTF-8"\s*>)/i, '$1' + newline +
      '<meta http-equiv="Content-Security-Policy" content="' + expected + '">' + newline +
      '<meta name="referrer" content="strict-origin-when-cross-origin">');
    fs.writeFileSync(filename, html);
  }
  const metas = [...html.matchAll(cspMeta)];
  assert.equal(metas.length, 1, file + ': exactly one CSP required');
  assert.equal(metas[0][0].match(/content="([^"]*)"/i)[1], expected, file + ': policy/hash mismatch; review changes then run node _security/check.cjs --write');
  assert.ok(metas[0].index < html.search(/<(?:script|style|link)\b/i), file + ': CSP must precede resources');
  assert.match(html, /<meta name="referrer" content="strict-origin-when-cross-origin">/, file + ': referrer policy');
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  assert.doesNotMatch(markup, /\son[a-z]+\s*=/i, file + ': inline event handler forbidden');
  assert.doesNotMatch(markup, /(?:href|src|action)\s*=\s*["']\s*(?:javascript:|http:|\/\/)/i, file + ': unsafe URL');
  assert.doesNotMatch(markup, /<(?:base|object|embed|form)\b/i, file + ': unexpected active content');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const src = match[1].match(/\bsrc="([^"]+)"/i);
    if (src) {
      if (/^https:/i.test(src[1])) {
        assert.equal(src[1], 'https://www.googletagmanager.com/gtag/js?id=AW-17039172373', file + ': unreviewed third-party script');
      } else {
        const target = src[1].split('?')[0];
        assert.ok(fs.existsSync(path.resolve(target.startsWith('/') ? root : path.dirname(filename), '.' + (target.startsWith('/') ? target : '/' + target))), file + ': missing script ' + target);
      }
    } else if (/application\/ld\+json/i.test(match[1])) {
      JSON.parse(match[2]);
    } else {
      new Script(match[2], { filename: file });
    }
  }
  for (const tag of markup.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/gi)) {
    assert.match(tag[0], /\brel="[^"]*\bnoopener\b/i, file + ': external window must not retain opener');
  }
}
for (const file of tracked.filter(file => file.endsWith('.js'))) {
  execFileSync(process.execPath, ['--check', path.join(root, file)]);
}
for (const file of tracked) {
  assert.doesNotMatch(file, /(?:^|\/)(?:\.env(?:\..+)?|id_rsa|id_ed25519|credentials\.json)$|\.(?:pem|p12|pfx|key)$/i, 'Private credentials must not be published: ' + file);
}
console.log('PASS: ' + pages.length + ' pages; CSP, script hashes, handlers, HTTPS links, opener isolation, syntax and private-file guardrails.');
