/* Parse text nodes, never HTML with regex. Desktop text remains in its own CSS variant. */
const fs = require('node:fs');
const path = require('node:path');
const mobileCopy = require('../assets/mobile-copy.js');
const {escape} = require('./components.cjs');
const root = path.resolve(__dirname, '..');
async function main() {
  const {parse} = await import('../_security/node_modules/parse5/dist/index.js');
  for (const relative of process.argv.slice(2)) {
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !file.endsWith('.html')) throw Error('Invalid page');
    const html = fs.readFileSync(file, 'utf8');
    const tree = parse(html, {sourceCodeLocationInfo:true});
    const edits = [];
    function visit(node, ancestors = []) {
      if (['head','script','style','noscript','svg','blockquote'].includes(node.tagName)) return;
      if (node.attrs?.some(a=>a.name==='class' && a.value.split(' ').includes('screen-copy'))) return;
      if (node.nodeName === '#text' && node.sourceCodeLocation) {
        const siblings = node.parentNode.childNodes;
        const next = siblings[siblings.indexOf(node)+1];
        const flowsOnMobile = ancestors.some(a=>a.attrs?.some(x=>x.name==='class' && x.value.split(' ').some(c=>['hero-bottom','intro-bottom'].includes(c))));
        const space = node.parentNode.tagName==='p' && next?.tagName==='br' && flowsOnMobile && !/\s$/.test(node.value) ? ' ' : '';
        const desktop = node.value + space;
        const mobile = mobileCopy(desktop);
        if (mobile !== desktop || space) {
          const {startOffset:start,endOffset:end} = node.sourceCodeLocation;
          edits.push({start,end,value:mobile===desktop ? escape(desktop) : `<span class="screen-copy copy-desktop">${escape(desktop)}</span><span class="screen-copy copy-mobile">${escape(mobile)}</span>`});
        }
      }
      for (const child of node.childNodes || []) visit(child, [...ancestors,node]);
    }
    visit(tree);
    let result = html;
    for (const edit of edits.sort((a,b)=>b.start-a.start)) result = result.slice(0,edit.start)+edit.value+result.slice(edit.end);
    fs.writeFileSync(file,result);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
