/* Add desktop-only sources without rewriting any fallback image attributes. */
const fs=require('node:fs');
const path=require('node:path');
const {parse}=require('../_security/node_modules/parse5');
const root=path.resolve(__dirname,'..');
const manifest=require('./desktop-thumbnails.json');
const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
const cls=(n,c)=>(attr(n,'class')||'').split(/\s+/).includes(c);
function within(n,c){for(let p=n;p;p=p.parentNode)if(cls(p,c))return true;return false;}
const recordFor=src=>manifest.records.find(r=>r.current.path===src||r.small.path===src);
function variants(r){return r.variants.length?r.variants:[r.small,r.current].filter((v,i,a)=>i===a.findIndex(w=>w.width===v.width));}
const srcset=r=>variants(r).map(v=>v.path+' '+v.width+'w').join(', ');
const poster=r=>(r.variants.at(-1)||r.current).path;
function sizes(n){
  if(within(n,'collection-link'))return '160px';
  if(within(n,'selected-lead')||within(n,'selected-wide'))return 'min(1040px, 90vw)';
  if(within(n,'vertical-reel-row'))return 'min(326px, 30vw)';
  if(within(n,'case-study'))return 'min(448px, 42vw)';
  if(within(n,'craft-visual'))return 'min(720px, 40vw)';
  return '(max-width:1100px) 44vw, min(512px, 31vw)';
}
for(const relative of process.argv.slice(2)){
  const target=path.resolve(root,relative);
  if(!target.startsWith(root+path.sep)||!target.endsWith('.html'))throw Error('Invalid page');
  const html=fs.readFileSync(target,'utf8'),tree=parse(html,{sourceCodeLocationInfo:true}),edits=[];
  const add=(n,value)=>{const at=n.sourceCodeLocation.startTag.endOffset-1;edits.push({start:at,end:at,text:value});};
  function visit(n){
    const loc=n.sourceCodeLocation;
    if(loc&&n.tagName==='img'&&!cls(n,'craft-mobile-image')){
      const r=recordFor(attr(n,'src'));
      if(r){
        const source='<source media="(min-width:901px)" srcset="'+srcset(r)+'" sizes="'+sizes(n)+'">';
        if(n.parentNode.tagName==='picture')edits.push({start:loc.startOffset,end:loc.startOffset,text:source});
        else edits.push({start:loc.startOffset,end:loc.endOffset,text:'<picture class="desktop-thumbnail">'+source+html.slice(loc.startOffset,loc.endOffset)+'</picture>'});
      }
    }
    if(loc&&n.tagName==='video'&&attr(n,'poster')){
      const r=recordFor(attr(n,'poster'));if(r?.variants.length)add(n,' data-desktop-poster="'+poster(r)+'"');
    }
    if(loc&&attr(n,'data-project')){
      const id=attr(n,'data-media-project')||attr(n,'data-project');
      const r=manifest.records.find(r=>r.id===id);if(r?.variants.length)add(n,' data-desktop-poster="'+poster(r)+'"');
    }
    if(loc&&attr(n,'data-process-image')){
      const r=recordFor(attr(n,'data-process-image'));if(r)add(n,' data-process-desktop-srcset="'+srcset(r)+'"');
    }
    (n.childNodes||[]).forEach(visit);
  }
  visit(tree);
  let out=html;for(const e of edits.sort((a,b)=>b.start-a.start))out=out.slice(0,e.start)+e.text+out.slice(e.end);
  fs.writeFileSync(target,out);
}
