'use strict';
// Static-site guardrails, not an HTML sanitizer or a general vulnerability scanner.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { Script } = require('node:vm');
const root = path.resolve(__dirname, '..');
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
function elements(node) {
  return [node, ...(node.childNodes || []).flatMap(elements), ...(node.content ? elements(node.content) : [])].filter(item => item.tagName);
}
const scriptText = node => (node.childNodes || []).map(child => child.value || '').join('');
const isCsp = node => node.tagName === 'meta' && attr(node, 'http-equiv')?.toLowerCase() === 'content-security-policy';
const isReferrer = node => node.tagName === 'meta' && attr(node, 'name')?.toLowerCase() === 'referrer';

function policy(file, nodes) {
  // parse5 applies browser-compatible HTML parsing and newline normalization.
  const hashes = nodes.filter(node => node.tagName === 'script' && attr(node, 'src') === undefined)
    .map(node => "'sha256-" + crypto.createHash('sha256').update(scriptText(node)).digest('base64') + "'");
  const home = file === 'index.html';
  const google = home ? ' https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com' : '';
  const googleScripts = home ? ' https://www.googletagmanager.com/gtag/js https://www.googleadservices.com/pagead/ https://www.google.com/pagead/ https://googleads.g.doubleclick.net/pagead/ https://pagead2.googlesyndication.com/pagead/' : '';
  return [
    "default-src 'self'", "base-uri 'none'", "object-src 'none'", "form-action 'none'",
    "script-src 'self'" + (hashes.length ? ' ' + [...new Set(hashes)].join(' ') : '') + googleScripts,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:" + google + (home ? ' https://www.google-analytics.com https://google.com https://www.google.com.br' : ''),
    "connect-src 'self'" + google + (home ? ' https://www.google-analytics.com https://ad.doubleclick.net https://google.com https://www.google.com.br' : ''),
    "media-src 'self'",
    "frame-src " + (home ? 'https://www.youtube-nocookie.com https://www.youtube.com https://www.googletagmanager.com' : "'none'"),
    "worker-src 'none'", "manifest-src 'self'", 'upgrade-insecure-requests'
  ].join('; ') + ';';
}

async function main() {
  const { parse } = await import('parse5');
  const parseElements = html => elements(parse(html, { sourceCodeLocationInfo: true }));
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const pages = tracked.filter(file => file.endsWith('.html'));
  for (const file of pages) {
    const filename = path.join(root, file);
    let html = fs.readFileSync(filename, 'utf8');
    let nodes = parseElements(html);
    const expected = policy(file, nodes);
    if (process.argv.includes('--write')) {
      const newline = html.includes('\r\n') ? '\r\n' : '\n';
      const oldMetas = nodes.filter(node => isCsp(node) || isReferrer(node));
      for (const node of oldMetas.sort((a, b) => b.sourceCodeLocation.startOffset - a.sourceCodeLocation.startOffset)) {
        const {startOffset, endOffset} = node.sourceCodeLocation;
        const end = html.startsWith(newline, endOffset) ? endOffset + newline.length : endOffset;
        html = html.slice(0, startOffset) + html.slice(end);
      }
      const charset = parseElements(html).find(node => node.tagName === 'meta' && attr(node, 'charset')?.toLowerCase() === 'utf-8');
      assert.ok(charset, file + ': UTF-8 charset required');
      const offset = charset.sourceCodeLocation.endOffset;
      const security = newline + '<meta http-equiv="Content-Security-Policy" content="' + expected + '">' + newline + '<meta name="referrer" content="strict-origin-when-cross-origin">';
      html = html.slice(0, offset) + security + html.slice(offset);
      fs.writeFileSync(filename, html);
      nodes = parseElements(html);
    }
    const metas = nodes.filter(isCsp);
    assert.equal(metas.length, 1, file + ': exactly one CSP required');
    assert.equal(attr(metas[0], 'content'), expected, file + ': policy/hash mismatch; review then run node _security/check.cjs --write');
    const firstResource = nodes.find(node => ['script', 'style', 'link'].includes(node.tagName));
    assert.ok(metas[0].sourceCodeLocation.startOffset < firstResource.sourceCodeLocation.startOffset, file + ': CSP must precede resources');
    const referrers = nodes.filter(isReferrer);
    assert.equal(referrers.length, 1, file + ': exactly one referrer policy required');
    assert.equal(attr(referrers[0], 'content'), 'strict-origin-when-cross-origin', file + ': referrer policy');
    for (const node of nodes) {
      assert.ok(!['base', 'object', 'embed', 'form'].includes(node.tagName), file + ': unexpected active content');
      for (const item of node.attrs || []) {
        assert.ok(!item.name.startsWith('on'), file + ': inline event handler forbidden: ' + item.name);
        if (['href', 'src', 'action'].includes(item.name)) {
          assert.doesNotMatch(item.value, /^\s*(?:javascript:|http:|\/\/)/i, file + ': unsafe URL');
        }
      }
      if (node.tagName === 'a' && attr(node, 'target') === '_blank') {
        assert.ok((attr(node, 'rel') || '').toLowerCase().split(/\s+/).includes('noopener'), file + ': external window must not retain opener');
      }
      if (node.tagName !== 'script') continue;
      const src = attr(node, 'src');
      if (src !== undefined) {
        if (src.startsWith('https:')) {
          assert.equal(src, 'https://www.googletagmanager.com/gtag/js?id=AW-17039172373', file + ': unreviewed third-party script');
        } else {
          const target = src.split('?')[0];
          const resolved = path.resolve(target.startsWith('/') ? root : path.dirname(filename), target.startsWith('/') ? '.' + target : target);
          assert.ok(resolved.startsWith(root + path.sep) && fs.existsSync(resolved), file + ': missing/invalid script ' + target);
        }
      } else if (attr(node, 'type') === 'application/ld+json') {
        JSON.parse(scriptText(node));
      } else {
        new Script(scriptText(node), { filename: file });
      }
    }
  }
  for (const file of tracked.filter(file => /\.(?:js|cjs)$/.test(file))) {
    execFileSync(process.execPath, ['--check', path.join(root, file)]);
  }
  for (const file of tracked) {
    assert.doesNotMatch(file, /(?:^|\/)(?:\.env(?:\..+)?|id_rsa|id_ed25519|credentials\.json)$|\.(?:pem|p12|pfx|key)$/i, 'Private credentials must not be published: ' + file);
  }
  console.log('PASS: ' + pages.length + ' pages; CSP, script hashes, handlers, HTTPS links, opener isolation, syntax and private-file guardrails.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
