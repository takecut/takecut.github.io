/* Remove decorative editorial labels at build time, not with display:none.
 * Keep functional labels, prices, project descriptions, attribution and SEO data. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const classes = node => (node?.attrs?.find(a => a.name === 'class')?.value || '').split(/\s+/);
const has = (node, names) => names.some(name => classes(node).includes(name));
const within = (node, names) => { for (let p=node.parentNode;p;p=p.parentNode) if(has(p,names)) return true; return false; };
function decorative(node) {
  if (has(node,['section-aside','section-count','work-index','media-format','editorial-note','cut-ruler','hero-coordinate'])) return true;
  if (has(node,['eyebrow'])) {
    // These labels identify controls, navigation groups, metrics and technical details.
    if (within(node,['site-footer','gear-toolbar','project-context','viewer-info']) || has(node.parentNode,['case-study'])) return false;
    return true;
  }
  if (has(node,['mono']) && within(node,['cut-cell','craft-visual','craft-item','service-list','gear-image','sector-tile-top','sector-steps','sector-deliverables','sector-hub-visual','intro-bottom'])) return true;
  if (has(node,['mono']) && (has(node.parentNode,['footer-bottom']) || (node.parentNode?.tagName==='a' && within(node,['mobile-menu'])))) return true;
  return false;
}
async function main() {
  const {parse} = await import('../_security/node_modules/parse5/dist/index.js');
  for (const relative of process.argv.slice(2)) {
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep)||!file.endsWith('.html')) throw Error('Invalid page');
    const html=fs.readFileSync(file,'utf8');
    const tree=parse(html,{sourceCodeLocationInfo:true});
    const edits=[];
    function visit(node) {
      if(['head','script','style','svg','noscript'].includes(node.tagName)) return;
      if(decorative(node) && node.sourceCodeLocation) {
        edits.push(node.sourceCodeLocation);
        return;
      }
      for(const child of node.childNodes||[]) visit(child);
    }
    visit(tree);
    let result=html;
    for(const {startOffset,endOffset} of edits.sort((a,b)=>b.startOffset-a.startOffset)) result=result.slice(0,startOffset)+result.slice(endOffset);
    fs.writeFileSync(file,result);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
